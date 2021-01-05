import { Pool, Client } from "pg";

console.log("IMPORTED DB");

export function helloWorld() {
  console.log("hello world");
}

let pool = new Pool({
  host: process.env.POSTGRESQL_HOST,
  user: process.env.POSTGRESQL_USERNAME,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE,
});

export async function query(q: string, ...args: string[]) {
  return pool.query(q, args);
}
