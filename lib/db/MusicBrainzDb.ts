import Knex from "knex";
import knexConstructor from "knex";
import { Label } from "../struct/Label";
import { Release } from "../struct/Release";

import * as DotEnvUtil from "../util/DotEnvUtil";

const maxConnections = 50;

export class MusicBrainzDb {
  knex: Knex;

  constructor() {
    DotEnvUtil.initEnvVars();

    let options = {
      host: process.env.MUSICBRAINZ_HOST,
      user: process.env.MUSICBRAINZ_USERNAME,
      password: process.env.MUSICBRAINZ_PASSWORD,
      database: process.env.MUSICBRAINZ_DATABASE,
    };

    this.knex = knexConstructor({
      client: "pg",
      connection: options,
      debug: false,
      pool: { min: 0, max: maxConnections },
    });
  }

  readonly releaseCountExpiry = 1000 * 60 * 60 * 24 * 7; //in millis

  private async refreshLabelReleaseCountTable() {
    await this.knex.schema.dropTableIfExists("label_release_count");
    await this.knex.schema.createTable("label_release_count", (table) => {
      table.increments();
      table.integer("label_id").notNullable();
      table.foreign("label_id").references("label.id");
      table.integer("count_approx").defaultTo(0).notNullable();
      table.timestamp("last_updated").defaultTo(this.knex.fn.now()).notNullable();
    });

    await this.knex.raw(
      `
        INSERT INTO 
          label_release_count (label_id, count_approx)
        SELECT 
          label.id, COUNT(release_label.id)
        FROM 
          label 
        LEFT JOIN 
          release_label ON release_label.label = label.id 
        GROUP BY 
          label.id
        `
    );

    await this.knex.schema.dropTableIfExists("release_date_info");
    await this.knex.raw(
      `
      CREATE TABLE release_date_info (
        id SERIAL PRIMARY KEY,
        release_id INT UNIQUE NOT NULL REFERENCES release(id),
        date_year SMALLINT,
        date_month SMALLINT,
        date_day SMALLINT
      )
    `);

    await this.knex.raw(
      `
        INSERT INTO
          release_date_info (release_id, date_year, date_month, date_day)
        SELECT DISTINCT ON (release_id)
          COALESCE(release_country.release, release_unknown_country.release) as release_id,
          COALESCE(release_country.date_year, release_unknown_country.date_year) as date_year,
          COALESCE(release_country.date_month, release_unknown_country.date_month) as date_month,
          COALESCE(release_country.date_day, release_unknown_country.date_day) as date_day
        FROM
          release
        LEFT OUTER JOIN
          release_country ON release_country.release = release.id
        LEFT OUTER JOIN
          release_unknown_country ON release_unknown_country.release = release.id
        WHERE
          COALESCE(release_country.release, release_unknown_country.release) IS NOT NULL
      `
    );

    await this.knex.raw(
      "CREATE INDEX IF NOT EXISTS release_date_info_idx_date_year ON release_date_info (date_year)"
    );

    await this.knex.raw(
      "CREATE INDEX IF NOT EXISTS release_date_info_idx_release_id ON release_date_info (release_id)"
    );
  }

  async createIndexes() {
    console.log("CREATING INDEXES!!!!!!");

    await this.knex.raw(
      "CREATE INDEX IF NOT EXISTS release_idx_name_search ON release USING GIN(to_tsvector('english', name))"
    );

    await this.knex.raw(
      "CREATE INDEX IF NOT EXISTS artist_credit_idx_name_search ON artist_credit USING GIN(to_tsvector('english', name))"
    );
  }

  /**
   * Checks and maintains any extra tables that are generated to speed up queries. Should be run
   * periodically to ensure the db remains up to date.
   */
  async runTableMaintenance() {
    this.createIndexes();

    let hasTable = await this.knex.schema.hasTable("label_release_count");
    let shouldRefreshTable = true;
    if (hasTable) {
      // using the timestamp for this is a bit hackish
      let result = await this.knex("label_release_count").select("last_updated").limit(1);
      if (result && result.length > 0) {
        let last_updated: Date = result[0].last_updated;
        if (last_updated.getTime() - Date.now() < this.releaseCountExpiry) {
          shouldRefreshTable = false;
        }
      }
    }

    let promise = Promise.resolve();

    if (shouldRefreshTable) {
      console.log("Refreshing DB meta tables");
      promise = this.refreshLabelReleaseCountTable();
    }

    return promise;
  }

  async lookupRelease(
    name: string,
    artist: string,
    year: number,
    fuzzy: boolean = false
  ): Promise<Release[]> {
    // Might be used to allow to choose between multiple releases of the
    // same album on the same label in future
    let limit = 1;

    let artistWhere = this.knex.raw("artist_credit.name = ?", artist);
    if (fuzzy) {
      artistWhere = this.knex.raw(
        "to_tsvector('english', artist_credit.name) @@ plainto_tsquery(?)",
        artist
      );
    }

    let nameWhere = this.knex.raw("release.name = ?", name);
    if (fuzzy) {
      nameWhere = this.knex.raw("to_tsvector('english', release.name) @@ plainto_tsquery(?)", name);
    }

    let dateWhere = this.knex.raw("release_date_info.date_year = ?", year);
    if (fuzzy) {
      dateWhere = this.knex.raw("TRUE");
    }

    let rows = await this.knex("release")
      .select(
        "release.gid as release_mbid",
        "release.name as release_name",
        "artist_credit.name as artist_name",
        "label.name as label_name",
        "label.gid as label_mbid",
        "label_release_count.count_approx as label_release_count",
        "release_date_info.date_year as release_year"
      )
      .leftOuterJoin("release_date_info", "release_date_info.release_id", "release.id")
      .innerJoin("release_label", "release_label.release", "release.id")
      .innerJoin("label", "label.id", "release_label.label")
      .innerJoin("label_release_count", "label_release_count.label_id", "label.id")
      .innerJoin("artist_credit", "artist_credit.id", "release.artist_credit")
      .where(artistWhere)
      .andWhere(nameWhere)
      .andWhere(dateWhere)
      .orderByRaw("release_year")
      .limit(limit);

    let releases: Release[] = [];
    for (let row of rows) {
      let release: Release = {
        mbid: row.release_mbid,
        name: row.release_name,
        artistName: row.artist_name,
        dateYear: row.release_year,
        label: {
          mbid: row.label_mbid,
          name: row.label_name,
          releaseCount: row.label_release_count,
        },
      };

      releases.push(release);
    }

    return releases;
  }

  async searchLabel(q: string, limit: number): Promise<Label[]> {
    let rows = await this.knex("label")
      .select("gid as mbid", "name", "label_release_count.count_approx as release_count")
      .leftOuterJoin("label_release_count", "label_release_count.label_id", "label.id")
      .whereRaw(`LOWER(label.name) LIKE LOWER(?)`, q + "%")
      .orderBy("label_release_count.count_approx", "DESC")
      .limit(limit);

    let labels: Label[] = rows.map((row) => {
      return {
        mbid: row.mbid,
        name: row.name,
        releaseCount: row.release_count,
      };
    });

    return labels;
  }

  async getLabelUrls(mbid: string) {
    let promise = this.knex("label");
  }
}
