import { Pool, Client } from "pg";
import { Label } from "../struct/Label";

import { MbEntityType } from "../struct/MusicBrainzEntityType";
import { Release } from "../struct/Release";

import { DateTime } from "luxon";

import knexConstructor from "knex";

import fs from "fs";
import dotenv from "dotenv";
import { MbEntity } from "../struct/MbEntity";

//Hack to ensure that environment variables are loaded correctly
if (process.env.NODE_ENV === "test") {
  const path = process.cwd() + "/" + ".env.test.local";
  let result = dotenv.config({ path: path });
}

let knex = knexConstructor({
  client: "pg",
  connection: {
    host: process.env.POSTGRESQL_HOST,
    user: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE,
  },
});

const LABEL_TABLE = "label";
const RELEASE_TABLE = "release";
const RELEASE_LABEL_TABLE = "release_label";
const SEARCH_RESULT_COUNT_TABLE = "mb_search_result_count";
const SEARCH_RESULT_TABLE = "mb_search_result";

export async function query(q: string, ...args: (string | number)[]) {
  return knex.raw(q, args);
}

export async function close(): Promise<void> {
  return knex.destroy();
}

//util function to reset the current db
//drops all tables and recreates them from 'schema.sql'
export async function resetDb() {
  await knex.schema.dropTable(RELEASE_LABEL_TABLE).catch(console.error);
  await knex.schema.dropTable(LABEL_TABLE).catch(console.error);
  await knex.schema.dropTable(RELEASE_TABLE).catch(console.error);

  await knex.schema.dropTable(SEARCH_RESULT_TABLE).catch(console.error);
  await knex.schema.dropTable(SEARCH_RESULT_COUNT_TABLE).catch(console.error);

  let schema = fs.readFileSync(process.cwd() + "/schema/schema.sql").toString();
  await knex.schema.raw(schema);
}

export async function insertLabel(label: Label) {
  return query(
    `
    INSERT INTO 
      ${LABEL_TABLE} (mbid, name) 
    VALUES 
      (?, ?) 
    ON CONFLICT 
      DO NOTHING
    `,
    label.mbid,
    label.name
  );
}

// Returns null if the label is not in the database
export async function readLabel(mbid: string): Promise<Label | null> {
  let result = await query(`SELECT * FROM ${LABEL_TABLE} WHERE mbid = ?`, mbid);

  if (result.rowCount > 0) {
    let row = result.rows[0];
    return { mbid: row.mbid, name: row.name };
  } else {
    return null;
  }
}

export async function insertRelease(release: Release) {
  let date: string | null = null;

  if (release.date) {
    console.log(typeof release?.date);
    date = release.date?.toISODate();
  }

  await knex(RELEASE_TABLE)
    .insert({
      mbid: release.mbid,
      name: release.name,
      release_date: date,
      release_group_mbid: release.releaseGroupMbid,
    })
    .onConflict("mbid")
    .ignore();

  console.log("labels " + release.labels);

  for (let label of release.labels) {
    //Make sure all the labels associated with this release are known
    await insertLabel(label);

    console.log("DB label: " + label);

    query(
      `
    INSERT INTO
      ${RELEASE_LABEL_TABLE} (release_mbid, label_mbid)
    VALUES
      (?, ?)
    ON CONFLICT
      DO NOTHING
    `,
      release.mbid,
      label.mbid
    );
  }
}

// Returns null if the release is not in the database
export async function readRelease(mbid: string): Promise<Release | null> {
  let result = await knex(RELEASE_TABLE).select("*").where("mbid", mbid);

  if (result.length > 0) {
    let row = result[0];
    let labelRows = await knex(RELEASE_LABEL_TABLE).select("*").where("release_mbid", row.mbid);

    let labelsPromise = await Promise.all(labelRows.map((row: any) => readLabel(row.label_mbid)));

    let date;
    if (row.release_date) {
      date = DateTime.fromJSDate(row?.release_date);
    }

    console.log("release group on read: " + row.release_group_mbid);

    return {
      mbid: row.mbid,
      name: row.name,
      date: date,
      labels: labelsPromise.filter((l) => l) as Label[],
      releaseGroupMbid: row.release_group_mbid,
    };
  } else {
    return null;
  }
}

/**
 * Update the stored MusicBrainz search results for a certain entity type (e.g. labels).
 * Will remove and replace the existing search results if they are cached.
 *
 * Can be used to cache the fact that a given search text produces no results by passing an
 * empty 'mbids' array.
 */
export async function updateSearchResults(
  searchText: string,
  mbids: string[],
  entityType: MbEntityType
) {
  //Delete existing (now outdated) search results
  await query(
    `DELETE FROM ${SEARCH_RESULT_COUNT_TABLE} WHERE search_text = ? AND mb_entity_type = ?`,
    searchText,
    entityType
  );

  let result = await query(
    `
    INSERT INTO 
      ${SEARCH_RESULT_COUNT_TABLE} (last_updated, search_text, result_count, mb_entity_type) 
    VALUES 
      (CURRENT_TIMESTAMP, ?, ?, ?)
    RETURNING
      id
    `,
    searchText,
    mbids.length,
    entityType
  );

  let newId = result.rows[0].id;

  for (let mbid of mbids) {
    await query(
      `
    INSERT INTO 
      ${SEARCH_RESULT_TABLE} 
    (result_group_id, mbid) 
      VALUES 
    (?, ?)
    `,
      newId,
      mbid
    );
  }
}

export interface DbSearchResults<T> {
  entities: T[];
  lastUpdated: Date;
  entityType: MbEntityType;
}

/**
 *
 * If the search result has not been cached, this function will return null.
 * If the search result has been cached, but returned no values, this function will return an object with
 * info on when the (empty) cached results were last updated.
 *
 * The values of entityType and T must match.
 */
export async function readSearchResults<T extends MbEntity>(
  searchText: string,
  limit: number,
  entityType: MbEntityType
): Promise<DbSearchResults<T> | null> {
  let resultTable = "";
  if (entityType === MbEntityType.LABEL) {
    resultTable = LABEL_TABLE;
  } else if (entityType === MbEntityType.RELEASE) {
    resultTable = RELEASE_TABLE;
  } else {
    throw Error("Unsupported EntityType: " + entityType);
  }

  let results = await knex(SEARCH_RESULT_COUNT_TABLE)
    .select("*")
    .leftOuterJoin(SEARCH_RESULT_TABLE, `${SEARCH_RESULT_COUNT_TABLE}.id`, "result_group_id")
    .leftOuterJoin(resultTable, `${resultTable}.mbid`, `${SEARCH_RESULT_TABLE}.mbid`)
    .where(`${SEARCH_RESULT_COUNT_TABLE}.search_text`, searchText)
    .where("mb_entity_type", entityType);

  console.log(JSON.stringify(results));
  // We have no result info for this search text
  if (results.length == 0) {
    return null;
  }

  let lastUpdated = results[0].last_updated;
  let resultCount = results[0].result_count;

  // this is not typesafe
  let entities: any[] = [];

  if (resultCount > 0) {
    if (entityType == MbEntityType.LABEL) {
      for (let row of results) {
        entities.push(readLabel(row.mbid));
        //entities.push({ mbid: row.mbid, name: row.name } as Label);
      }
    } else if (entityType == MbEntityType.RELEASE) {
      for (let row of results) {
        //entities.push(readRelease(row.mbid));
        entities.push({
          mbid: row.mbid,
          name: row.name,
          date: row.release_date,
          releaseGroupMbid: row.release_group_mbid,
        } as Release);
      }
    }
  }

  return { entities: entities, lastUpdated: lastUpdated, entityType: entityType };
}
