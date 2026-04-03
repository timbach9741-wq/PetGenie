import { GoogleGenerativeAI } from '@google/generativeai';
import 'dotenv/config';

const apiKey = process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function test() {
  try {
    const result = await model.generateContent("Hello!");
    console.log(result.response.text());
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
