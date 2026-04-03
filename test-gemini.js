import 'dotenv/config';
const key = process.env.VITE_GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
const response = await fetch(url);
const data = await response.json();
console.log(data.models.map(m => m.name));
