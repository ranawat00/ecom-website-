const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    console.log("Testing OpenAI...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hi" }],
    });
    console.log("Success OpenAI:", response.choices[0].message.content);
  } catch (e) {
    console.error("Error OpenAI:", e.message);
  }
}

test();
