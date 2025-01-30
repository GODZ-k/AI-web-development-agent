import { GEMINI_API_KEY } from "./env.config.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
export const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
export const model = ai.getGenerativeModel({
    model: "gemini-1.5-flash",
});
