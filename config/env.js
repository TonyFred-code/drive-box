import { configDotenv } from "dotenv";

configDotenv();
configDotenv({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
  override: true,
}); // loads environment specific .env
