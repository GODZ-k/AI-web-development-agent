import express from "express";
import { PORT } from "./config/env.config.js";
import { model } from "./config/gemini.config.js";
import cors from "cors";
import { BASE_PROMPT, getSystemPrompt } from "./common/prompt.js";
import { basePrompt as nodeBasePrompt } from "./defaults/node.js";
import { basePrompt as reactBasePrompt } from "./defaults/react.js";
const app = express();
app.use(cors());
app.use(express.json());
app.post("/chat", async (req, res) => {
    const message = req.body.messages;
    const response = await model.generateContent({
        contents: message,
        generationConfig: { maxOutputTokens: 10000, temperature: 0.1 },
        systemInstruction: getSystemPrompt(),
    });
    const result = await response.response.text();
    console.log("result", result);
    return res.json({
        response: result
    });
});
app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;
    const response = await model.generateContent({
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }],
            },
        ],
        generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.1,
        },
        systemInstruction: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
    });
    const answer = (await response.response.text()).trim();
    console.log("answer:", `"${answer}"`); // Add quotes to detect hidden characters
    if (answer === "react") {
        return res.json({
            prompts: [
                BASE_PROMPT,
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [reactBasePrompt],
        });
    }
    else if (answer === "node") {
        return res.json({
            prompts: [
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [nodeBasePrompt],
        });
    }
    return res.status(403).json({ message: "You cant access this" });
});
app.listen(PORT, () => {
    console.log("Serve is listning on port", PORT);
});
