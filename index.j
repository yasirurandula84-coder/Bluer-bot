const { Telegraf } = require('telegraf');
const sharp = require('sharp');
const fetch = require('node-fetch');
require('dotenv').config();

const bot = new Telegraf(process.env.WORKER_BOT_TOKEN);

// පින්තූරයක් බොට් වෙත ලැබුණු විට ක්‍රියාත්මක වීම
bot.on('photo', async (ctx) => {
    try {
        await ctx.reply("⏳ පින්තූරය පරීක්ෂා කර බ්ලර් කරමින් පවතී, රැඳී සිටින්න...");

        // 1. Telegram සර්වර් එකෙන් ෆොටෝ එකේ File URL එක ලබා ගැනීම
        const photoArray = ctx.message.photo;
        const largestPhoto = photoArray[photoArray.length - 1]; // උසස්ම තත්ත්වයේ ෆොටෝ එක
        const fileLink = await ctx.telegram.getFileLink(largestPhoto.file_id);

        // 2. ෆොටෝ එක ඩවුන්ලෝඩ් කර බෆර් එකට හරවා ගැනීම
        const response = await fetch(fileLink.href);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Sharp භාවිතයෙන් ෆොටෝ එක සම්පූර්ණයෙන්ම බ්ලර් කිරීම (Lightweight & Safe for 512MB RAM)
        // මෙහි sigma අගය (උදා: 15) වැඩි වන විට බ්ලර් වීම වැඩි වේ.
        const blurredBuffer = await sharp(buffer)
            .blur(15) 
            .toBuffer();

        // 4. බ්ලර් කළ පින්තූරය යූසර්ට ආපසු යැවීම
        await ctx.replyWithPhoto(
            { source: blurredBuffer },
            { caption: "✅ සංවේදී අන්තර්ගතයන් ආරක්ෂා කර ගැනීමට පින්තූරය ස්වයංක්‍රීයව බ්ලර් කරන ලදී." }
        );

    } catch (error) {
        console.error("Blur processing error:", error);
        ctx.reply("❌ පින්තූරය ප්‍රොසෙස් කිරීමේදී දෝෂයක් ඇති විය.");
    }
});

bot.start((ctx) => {
    ctx.reply("👋 ආයුබෝවන්! මම ඔබේ Auto-Blur Worker Bot එකයි. මට සංවේදී පින්තූරයක් එවන්න, මම එය බ්ලර් කර දෙන්නෙමි.");
});

// Bot Launch
bot.launch().then(() => {
    console.log("Worker Bot is running successfully!");
}).catch(err => {
    console.error("Failed to launch worker bot:", err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
