const fs = require('fs');

const key = 'AIzaSyDyqJrNmUEN7jyRv7tht0tcREd6U9smELI';
const code = fs.readFileSync('public/chatbot/js/cb_app.js', 'utf8');
const sysMatch = code.match(/const DEFAULT_SYSTEM_PROMPT = `([\s\S]*?)`;/);
const sysPrompt = sysMatch[1];

async function testPrompt() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=' + key, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sysPrompt }] },
      contents: [{ role: 'user', parts: [{ text: '자기소개 부탁해요! 어떤 강점이 있으신가요?' }] }]
    })
  });
  const data = await res.json();
  console.log(data.candidates[0].content.parts[0].text);
}
testPrompt();
