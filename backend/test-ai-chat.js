const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const chat = model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 500 },
    });
    const result = await chat.sendMessage("Hi");
    console.log("Success with startChat:", result.response.text());
  } catch (e) {
    console.error("Error with startChat:", e.message);
  }
}

test();
