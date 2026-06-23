import dotenv from "dotenv";
import { resolve } from "node:path";

const envPath = {
  development: ".env.dev",
  staging: "staging.env", // step before production
  production: ".env.prod",
};

dotenv.config({ path: resolve(`./Config/${envPath.development}`) });

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = process.env.PORT || 5000;
export const DB_URL = process.env.DB_URL;
export const SALT_ROUNDS = process.env.SALT_ROUNDS || 12;
export const ENC_KEY = process.env.ENC_KEY;

// ADMIN
export const ACCESS_TOKEN_ADMIN_SECRET = process.env.ACCESS_TOKEN_ADMIN_SECRET;
export const REFRESH_TOKEN_ADMIN_SECRET =
  process.env.REFRESH_TOKEN_ADMIN_SECRET;
export const ACCESS_TOKEN_ADMIN_EXPIRES_IN =
  process.env.ACCESS_TOKEN_ADMIN_EXPIRES_IN;
export const REFRESH_TOKEN_ADMIN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_ADMIN_EXPIRES_IN;

// USER
export const ACCESS_TOKEN_USER_SECRET = process.env.ACCESS_TOKEN_USER_SECRET;
export const REFRESH_TOKEN_USER_SECRET = process.env.REFRESH_TOKEN_USER_SECRET;
export const ACCESS_TOKEN_USER_EXPIRES_IN =
  process.env.ACCESS_TOKEN_USER_EXPIRES_IN;
export const REFRESH_TOKEN_USER_EXPIRES_IN =
  process.env.REFRESH_TOKEN_USER_EXPIRES_IN;

// GOOGLE OAUTH
export const CLIENT_ID = process.env.CLIENT_ID;
