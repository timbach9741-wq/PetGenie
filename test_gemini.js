const API_KEY = "***REMOVED_API_KEY***";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const systemText = "You are Dr. Silverman";
const userInput = "My dog is licking his paws";

const body = {
  contents: [{ role: 'user', parts: [{ text: userInput }] }],
  system_instruction: { parts: [{ text: systemText }] },
};

async function test() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Gemini API HTTP Error:', response.status, JSON.stringify(errorData, null, 2));
    return;
  }

  const data = await response.json();
  console.log('Success:', JSON.stringify(data, null, 2));
}

test();
