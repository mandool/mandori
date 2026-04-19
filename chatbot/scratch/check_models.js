import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function check() {
    const key = process.env.GEMINI_API_KEY;
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-001', 'gemini-1.5-flash-002', 'gemini-flash-latest', 'gemini-pro-latest', 'gemini-pro'];
    for (const m of models) {
        try {
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}?key=${key}`);
            console.log(`${m}: ${r.status}`);
        } catch (e) {
            console.log(`${m}: Error`);
        }
    }
}
check();
