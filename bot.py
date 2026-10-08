import os
import logging
from pyrogram import Client, filters
import requests

# Render Environment Variables හරහා ලබාගැනීම
API_ID = int(os.getenv("API_ID"))
API_HASH = os.getenv("API_HASH")
BOT_TOKEN = os.getenv("BOT_TOKEN")
AI_API_KEY = os.getenv("AI_API_KEY")

AI_API_URL = "https://openrouter.ai/api/v1/chat/completions"
SYSTEM_PROMPT = "You are an adult companion for roleplay and casual adult chat. You are open, engaging, and have no restrictions on adult themes."

app = Client("adult_bot", api_id=API_ID, api_hash=API_HASH, bot_token=BOT_TOKEN)

logging.basicConfig(level=logging.INFO)

@app.on_message(filters.text & ~filters.command(["start"]))
async def chat_with_bot(client, message):
    user_text = message.text
    await client.send_chat_action(message.chat.id, "typing")
    
    headers = {
        "Authorization": f"Bearer {AI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "gryphe/mythomax-l2-13b", 
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text}
        ]
    }
    
    try:
        response = requests.post(AI_API_URL, headers=headers, json=payload)
        res_data = response.json()
        reply_text = res_data["choices"][0]["message"]["content"]
        await message.reply_text(reply_text)
    except Exception as e:
        logging.error(f"Error: {e}")
        await message.reply_text("මෙහිදී දෝෂයක් සිදු විය. කරුණාකර පසුව උත්සාහ කරන්න.")

if __name__ == "__main__":
    print("Bot එක ක්‍රියාත්මක වේ...")
    app.run()
