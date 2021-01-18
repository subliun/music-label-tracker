import Knex from "knex";
import knexConstructor from "knex";

import * as DotEnvUtil from "../util/DotEnvUtil";

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

    let promise = this.knex.raw(
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

    return promise;
  }

  /**
   * Checks and maintains any extra tables that are generated to speed up queries. Should be run
   * periodically to ensure the db remains up to date.
   */
  async runTableMaintenance() {
    let hasTable = await this.knex.schema.hasTable("label_release_count");
    let shouldRefreshTable = true;
    if (hasTable) {
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
      promise = this.refreshLabelReleaseCountTable();
    }

    return promise;
  }

  async lookupRelease(name: string, artist: string) {
    let promise = this.knex("release")
      .select(
        "release.gid as release_mbid",
        "release.name as release_name",
        "artist_credit.name as artist_name",
        "label.name as label_name",
        "label.gid as label_mbid",
        "release_country.date_year as rc_year",
        "release_unknown_country.date_year as uc_year"
      )
      .leftOuterJoin("release_country", "release_country.release", "release.id")
      .leftOuterJoin("release_unknown_country", "release_unknown_country.release", "release.id")
      .innerJoin("release_label", "release_label.release", "release.id")
      .innerJoin("label", "release_label.label", "label.id")
      .innerJoin("artist_credit", "artist_credit.id", "release.artist_credit")
      .where({ "release.name": name, "artist_credit.name": artist })
      .orderBy(["rc_year", "uc_year"])
      .limit(5);

    return promise;
  }

  async searchLabel(q: string, limit: number) {
    let popularLabels = await this.knex("label")
      .select("name", "gid as mbid", "label_release_count.count_approx")
      .leftOuterJoin("label_release_count", "label_release_count.label_id", "label.id")
      .orderBy("label_release_count.count_approx", "DESC")
      .limit(50);

      console.log(popularLabels);

    let promise = this.knex("label")
      .select("name", "gid as mbid", "label_release_count.count_approx")
      .leftOuterJoin("label_release_count", "label_release_count.label_id", "label.id")
      .whereRaw(`LOWER(label.name) LIKE LOWER(?)`, q + "%")
      .orderBy("label_release_count.count_approx", "DESC")
      .limit(limit);

    return promise;
  }

  async getLabelUrls(mbid: string) {
    let promise = this.knex("label").
  }
}