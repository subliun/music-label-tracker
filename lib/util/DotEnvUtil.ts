import dotenv from "dotenv";

/**
 * Read in the correct environment variables from .env files and use them 
 * to initialise `process.env`.
 */
export function initEnvVars() {
  let path = "";

  //Hack to ensure that environment variables are loaded correctly
  //as they are not loaded if Next JS is not set up yet
  if (process.env.NODE_ENV === "test") {
    path = process.cwd() + "/" + ".env.test.local";
  } else {
    path = process.cwd() + "/" + ".env.local";
  }

  dotenv.config({ path: path });
}
