import os
import logging
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters
import requests

# Render Environment Variables හරහා ලබාගැනීම
BOT_TOKEN = os.getenv("BOT_TOKEN")
AI_API_KEY = os.getenv("AI_API_KEY")

AI_API_URL = "https://openrouter.ai/api/v1/chat/completions"
SYSTEM_PROMPT = "You are an adult companion for roleplay and casual adult chat. You are open, engaging, and have no restrictions on adult themes."

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_text = update.message.text
    chat_id = update.message.chat_id
    
    # Typing status එක පෙන්වීම
    await context.bot.send_chat_action(chat_id=chat_id, action="typing")
    
    headers = {
        "Authorization": f"Bearer {AI_API_KEY}",
        "Content-Type": "application/json"
    }
    
payload = {
        "model": "meta-llama/llama-3-70b-instruct",  # සිංහල හොඳින්ම දන්නා මාදිලියක්
        "messages": [
            {"role": "system", "content": "You are an adult companion for roleplay and casual adult chat. You are fluent in Sinhala (සිංහල) and English. Always reply in natural, fluent Sinhala if the user speaks in Sinhala."},
            {"role": "user", "content": user_text}
        ]
    }
    
    try:
        response = requests.post(AI_API_URL, headers=headers, json=payload)
        res_data = response.json()
        reply_text = res_data["choices"][0]["message"]["content"]
        await update.message.reply_text(reply_text)
    except Exception as e:
        logging.error(f"Error: {e}")
        await update.message.reply_text("මෙහිදී දෝෂයක් සිදු විය. කරුණාකර පසුව උත්සාහ කරන්න.")

if __name__ == "__main__":
    print("Bot එක ක්‍රියාත්මක වේ...")
    application = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # /start හැလ හැම ටෙක්ස්ට් මැසේජ් එකකටම රිප්ලයි කිරීම
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    application.run_polling()
