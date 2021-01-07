import { Pool, Client } from "pg";
import { Label } from "../struct/Label";

import dotenv from "dotenv";
import { MusicBrainzEntityType } from "../musicbrainz/MusicBrainzEntityType";

//Hack to ensure that environment variables are loaded correctly
if (process.env.NODE_ENV === "test") {
  const path = process.cwd() + "/" + ".env.test.local";
  let result = dotenv.config({ path: path });
}

let pool = new Pool({
  host: process.env.POSTGRESQL_HOST,
  user: process.env.POSTGRESQL_USERNAME,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE,
});

interface DbUpdateInfo {
  lastUpdated: Date;
}

const LABEL_TABLE = "label";
const SEARCH_RESULT_COUNT_TABLE = "mb_search_result_count";
const SEARCH_RESULT_TABLE = "mb_search_result";

export async function query(q: string, ...args: (string | number)[]) {
  return pool.query(q, args);
}

export async function close(): Promise<void> {
  pool.end();
}

export function insertLabel(label: Label) {
  query(
    `
    INSERT INTO 
      ${LABEL_TABLE} (last_updated, mbid, name) 
    VALUES 
      (CURRENT_TIMESTAMP, $1, $2) 
    ON CONFLICT 
      DO NOTHING
    `,
    label.mbid,
    label.name
  );
}

// Returns null if the label is not in the database
export async function readLabel(mbid: string): Promise<(Label & DbUpdateInfo) | null> {
  let result = await query(`SELECT * FROM ${LABEL_TABLE} WHERE mbid = $1`, mbid);

  if (result.rowCount > 0) {
    let row = result.rows[0];
    return { mbid: row.mbid, name: row.name, lastUpdated: row.lastUpdated };
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
export async function updateSearchResults(searchText: string, mbids: string[], entityType: MusicBrainzEntityType) {
  //Delete existing (now outdated) search results
  await query(
    `DELETE FROM ${SEARCH_RESULT_COUNT_TABLE} WHERE search_text = $1 AND mb_entity_type = $2`, 
  searchText, entityType);

  let result = await query(
    `
    INSERT INTO 
      ${SEARCH_RESULT_COUNT_TABLE} (last_updated, search_text, result_count, mb_entity_type) 
    VALUES 
      (CURRENT_TIMESTAMP, $1, $2, $3)
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
    ($1, $2)
    `,
      newId,
      mbid,
    );
  }
}

export interface DbSearchResults extends DbUpdateInfo {
  mbids: string[];
  lastUpdated: Date;
  entityType: MusicBrainzEntityType;
}

/**
 * Returns the cached search results for the given search text.
 * 
 * If the search result has not been cached, this function will return null.
 * If the search result has been cached, but returned no values, this function will return an object with
 * info on when the (empty) cached results were last update.
 */
export async function readSearchResults(searchText: string, limit: number): Promise<DbSearchResults | null> {
  let resultCountInfo = await query(
    `SELECT * FROM ${SEARCH_RESULT_COUNT_TABLE} WHERE search_text = $1`,
    searchText
  );

  // We have no result info for this search text
  if (resultCountInfo.rows.length == 0) {
    return null;
  }

  let lastUpdated = resultCountInfo.rows[0].last_updated;
  let typedEntityTypeString = resultCountInfo.rows[0].mb_entity_type as keyof typeof MusicBrainzEntityType;
  let entityType: MusicBrainzEntityType = MusicBrainzEntityType[typedEntityTypeString];

  let result = await query(
    `SELECT 
      * 
    FROM 
      ${SEARCH_RESULT_TABLE}
    INNER JOIN
      ${SEARCH_RESULT_COUNT_TABLE} AS result_group ON result_group.id = result_group_id
    WHERE 
      search_text = $1 LIMIT $2
    `,
    searchText,
    limit
  );

  let mbids = result.rows.map((row) => row.mbid);

  return { mbids: mbids, lastUpdated: lastUpdated, entityType: entityType };
}