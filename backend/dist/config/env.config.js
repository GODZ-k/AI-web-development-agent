import "dotenv/config";
import { getEnv } from "../common/get-Env.js";
export const PORT = getEnv("PORT", "8082");
export const GEMINI_API_KEY = getEnv("GEMINI_API_KEY", "");
