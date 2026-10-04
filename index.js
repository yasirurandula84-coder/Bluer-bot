const { Telegraf } = require('telegraf');
const express = require('express');
require('dotenv').config();

// Render එකේ Port එක බලාපොරොත්තු වන නිසා කුඩා Express සර්වර් එකක්
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Cross-Promotion Bot is running successfully!');
});

app.listen(PORT, () => {
    console.log(`Promo Bot server is listening on port ${PORT}`);
});

const bot = new Telegraf(process.env.PROMO_BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_ID; // ඔබේ Telegram User ID එක
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID; // ප්‍රධාන චැනල් එකේ ID හෝ Username එක (උදා: @your_channel)

bot.on('photo', async (ctx) => {
    if (ctx.from.id.toString() !== ADMIN_ID) {
        return ctx.reply("❌ ඔබට මෙම බොට් හරහා ප්‍රමෝෂන් පෝස්ට් යැවීමට අවසර නැත.");
    }

    try {
        const photoArray = ctx.message.photo;
        const largestPhoto = photoArray[photoArray.length - 1];
        const originalCaption = ctx.message.caption || "";

        // 1. උඩින් වැටෙන Quote style එක සහ යටින් සම්බන්ධ වීමට අවශ්‍ය username එක එකතු කිරීම
        const formattedCaption = 
`> 📢 **SPONSORED PROMOTION & CROSS-PROMOTION**
--------------------------------------------------
${originalCaption}

--------------------------------------------------
💡 ඔබටත් cross promotion එකක් අවශ්‍යනම් පහළ bot ට message එකක් දාන්න:
👉 @kamayahana_inbox_bot`;

        // 2. ප්‍රධාන චැනල් එකට පෝස්ට් කිරීම (බටන් කිසිවක් නොමැතිව)
        await ctx.telegram.sendPhoto(TARGET_CHANNEL_ID, largestPhoto.file_id, {
            caption: formattedCaption,
            parse_mode: 'Markdown'
        });

        await ctx.reply("✅ ප්‍රමෝෂන් ඇඩ් එක සාර්ථකව චැනල් එකට පෝස්ට් කරන ලදී!");

    } catch (error) {
        console.error("Promo post error:", error);
        ctx.reply("❌ පෝස්ට් කිරීමේදී දෝෂයක් ඇති විය: " + error.message);
    }
});

bot.start((ctx) => {
    ctx.reply("👋 Cross-Promotion Bot සූදානම්! චැනල් එකට යැවිය යුතු ප්‍රමෝෂන් පින්තූරය සහ විස්තරය මට එවන්න.");
});

bot.launch().then(() => {
    console.log("Cross-Promotion Bot is running successfully!");
}).catch(err => {
    console.error("Failed to launch promo bot:", err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
