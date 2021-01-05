import { Pool, Client } from "pg";
import { Label } from "../struct/Label";

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
const LABEL_SEARCH_RESULT_COUNT_TABLE = "mb_label_search_result_count";
const LABEL_SEARCH_RESULT_TABLE = "mb_label_search_result";

export async function query(q: string, ...args: (string | number)[]) {
  return pool.query(q, args);
}

export function insertLabel(label: Label) {
  query(
    `INSERT INTO ${LABEL_TABLE} (last_updated, mbid, name) VALUES (CURRENT_TIMESTAMP, $1, $2)`,
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
 * Update the stored label search results.
 * Will remove and replace the existing search results if they are cached.
 *
 * Can be used to cache the fact that a given search text produces no results by passing an
 * empty 'mbids' array.
 */
export function updateLabelSearchResults(searchText: string, mbids: string[]) {
  query(
    `
    INSERT INTO 
      ${LABEL_SEARCH_RESULT_COUNT_TABLE} (last_updated, search_text, result_count) 
    VALUES 
      (CURRENT_TIMESTAMP, $1, $2)
    `,
    searchText,
    mbids.length
  );

  for (let mbid of mbids) {
    query(
      `
    INSERT INTO 
      ${LABEL_SEARCH_RESULT_TABLE} 
    (search_text, result_mbid) 
      VALUES 
    ($1, $2)
    `,
      searchText,
      mbid
    );
  }
}

interface DbLabelSearchResults extends DbUpdateInfo {
  mbids: string[];
  lastUpdated: Date;
}

/**
 * Returns the cached label search results on MusicBrainz for the given search text.
 * If the search result has not been cached, this function will return null.
 * If the search result has been cached, but returned no values, this function will return an object with
 * info on when the (empty) cached results were last update.
 */
export async function readLabelSearchResults(searchText: string, limit: number): Promise<DbLabelSearchResults | null> {
  let resultCountInfo = await query(
    `SELECT * FROM ${LABEL_SEARCH_RESULT_COUNT_TABLE} WHERE search_text = $1`,
    searchText
  );

  // We have no result info for this search text
  if (resultCountInfo.rowCount == 0) {
    return null;
  }

  let lastUpdated = resultCountInfo.rows[0].last_updated;

  let result = await query(
    `SELECT * FROM ${LABEL_SEARCH_RESULT_TABLE} WHERE search_text = $1 LIMIT $2`,
    searchText,
    limit
  );

  let mbids = result.rows.map((row) => row.mbid);

  return { mbids: mbids, lastUpdated: lastUpdated };
}
