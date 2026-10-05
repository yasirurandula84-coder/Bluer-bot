const { Telegraf } = require('telegraf');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Cross-Promotion Bot is running successfully!');
});

app.listen(PORT, () => {
    console.log(`Promo Bot server is listening on port ${PORT}`);
});

const bot = new Telegraf(process.env.PROMO_BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_ID; 
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID; 

// පොදු ප්‍රමෝෂන් ෆෝමැට් එක සකස් කිරීමේ ෆංක්ෂන් එක
const createPromoContent = (text) => {
    return `> 📢 **SPONSORED PROMOTION & CROSS-PROMOTION**
--------------------------------------------------
${text}

--------------------------------------------------
💡 ඔබටත් cross promotion එකක් අවශ්‍යනම් පහළ bot ට message එකක් දාන්න:
👉 @kamayahana_inbox_bot`;
};

// 1. පින්තූරයක් සමඟ මැසේජ් එකක් එව්වොත්
bot.on('photo', async (ctx) => {
    if (ctx.from.id.toString() !== ADMIN_ID) {
        return ctx.reply("❌ ඔබට මෙම බොට් හරහා ප්‍රමෝෂන් පෝස්ට් යැවීමට අවසර නැත.");
    }

    try {
        const photoArray = ctx.message.photo;
        const largestPhoto = photoArray[photoArray.length - 1];
        const originalCaption = ctx.message.caption || "";
        const formattedCaption = createPromoContent(originalCaption);

        const sentMessage = await ctx.telegram.sendPhoto(TARGET_CHANNEL_ID, largestPhoto.file_id, {
            caption: formattedCaption,
            parse_mode: 'Markdown'
        });

        await ctx.reply("✅ ප්‍රමෝෂන් ෆොටෝ ඇඩ් එක සාර්ථකව චැනල් එකට පෝස්ට් කරන ලදී!\n⏳ පැය 24කින් ස්වයංක්‍රීයව මැකී යනු ඇත.");

        scheduleDeletion(sentMessage.message_id);

    } catch (error) {
        console.error("Promo photo error:", error);
        ctx.reply("❌ දෝෂයක් ඇති විය: " + error.message);
    }
});

// 2. ටෙක්ස්ට් (Text) පමණක් එව්වොත්
bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return; // /start වැනි කමාන්ඩ් ඉවත දැමීමට

    if (ctx.from.id.toString() !== ADMIN_ID) {
        return ctx.reply("❌ ඔබට මෙම බොට් හරහා ප්‍රමෝෂන් පෝස්ට් යැවීමට අවසර නැත.");
    }

    try {
        const originalText = ctx.message.text;
        const formattedText = createPromoContent(originalText);

        const sentMessage = await ctx.telegram.sendMessage(TARGET_CHANNEL_ID, formattedText, {
            parse_mode: 'Markdown'
        });

        await ctx.reply("✅ ප්‍රමෝෂන් ටෙක්ස්ට් ඇඩ් එක සාර්ථකව චැනල් එකට පෝස්ට් කරන ලදී!\n⏳ පැය 24කින් ස්වයංක්‍රීයව මැකී යනු ඇත.");

        scheduleDeletion(sentMessage.message_id);

    } catch (error) {
        console.error("Promo text error:", error);
        ctx.reply("❌ දෝෂයක් ඇති විය: " + error.message);
    }
});

// පැය 24කින් මැකීමේ ෆංක්ෂන් එක
function scheduleDeletion(messageId) {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    setTimeout(async () => {
        try {
            await bot.telegram.deleteMessage(TARGET_CHANNEL_ID, messageId);
            console.log(`Successfully auto-deleted promotion message ID: ${messageId}`);
        } catch (delError) {
            console.error("Failed to auto-delete message:", delError);
        }
    }, TWENTY_FOUR_HOURS);
}

bot.start((ctx) => {
    ctx.reply("👋 Cross-Promotion Bot සූදානම්! ඔබට අවශ්‍ය ප්‍රමෝෂන් පින්තූරය (කැප්ෂන් එක සමඟ) හෝ ටෙක්ස්ට් එක පමණක් මට එවන්න.");
});

bot.launch().then(() => {
    console.log("Cross-Promotion Bot is running successfully!");
}).catch(err => {
    console.error("Failed to launch promo bot:", err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
