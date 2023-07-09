
import { Configuration, OpenAIApi } from "openai";
import {env} from "./env.js";

const configuration = new Configuration({
  apiKey: env.apikey,
});
const openai = new OpenAIApi(configuration);

export const reply = async (status, prompt, gpt="gpt-4") => {
    const chatCompletion = await openai.createChatCompletion({
        model: gpt,
        temperature:0.68,
        messages: [{role: "system", content: prompt},{role: "user", content: status}],
    });
    console.log(chatCompletion.data.choices[0].message);
    return chatCompletion.data.choices[0].message;
}