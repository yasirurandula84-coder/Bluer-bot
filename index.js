const { Telegraf } = require('telegraf');
const sharp = require('sharp');
const fetch = require('node-fetch');
const express = require('express'); // 1. Express එක එකතු කරගන්නවා
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Render එකේ Port එක බලාපොරොත්තු වන නිසා කුඩා සර්වර් එකක් ස්ටාර්ට් කරයි
app.get('/', (req, res) => {
    res.send('Auto-Blur Worker Bot is running successfully!');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

const bot = new Telegraf(process.env.WORKER_BOT_TOKEN);

// පින්තූරයක් බොට් වෙත ලැබුණු විට ක්‍රියාත්මක වීම
bot.on('photo', async (ctx) => {
    try {
        await ctx.reply("⏳ පින්තූරය ප්‍රොසෙස් කරමින් පවතී, පොඩ්ඩක් ඉන්න...");

        const photoArray = ctx.message.photo;
        const largestPhoto = photoArray[photoArray.length - 1]; 
        const fileLink = await ctx.telegram.getFileLink(largestPhoto.file_id);

        const response = await fetch(fileLink.href);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Sharp භාවිතයෙන් blur කිරීම සහ සයිස් එක ප්‍රශස්ත කිරීම
        const processedBuffer = await sharp(buffer)
            .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
            .blur(15)
            .jpeg({ quality: 80 })
            .toBuffer();

        await ctx.replyWithPhoto(
            { source: processedBuffer },
            { caption: "✅ සාර්ථකයි! පින්තූරය බ්ලර් කරන ලදී." }
        );

    } catch (error) {
        console.error("Processing error:", error);
        ctx.reply("❌ දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න.");
    }
});

bot.start((ctx) => {
    ctx.reply("👋 Auto-Blur Worker Bot සූදානම්! මට ෆොටෝ එකක් එවන්න.");
});

// Bot Launch
bot.launch().then(() => {
    console.log("Worker Telegram Bot is running successfully!");
}).catch(err => {
    console.error("Failed to launch worker bot:", err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
