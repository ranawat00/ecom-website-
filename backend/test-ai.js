const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Hi");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
