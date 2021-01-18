import knexConstructor from "knex";

import fs from "fs";
import * as DotEnvUtil from "../util/DotEnvUtil";

//read in env vars for db setup
DotEnvUtil.initEnvVars();

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
