import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY } from "./env.config.js";
export const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
});
