const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const TELEGRAM_BOT_TOKEN = '927129973:AAGN3Yr7uRZfEemhaxq-7aPUUFQx8Lusdw';
const ADMIN_CHAT_ID = '9274490522';
const PORT = process.env.PORT || 3000;

app.post('/api/request-deposit', async (req, res) => {
    const { username, amount, txn } = req.body;

    const message = `📥 <b>ငွေသွင်းတောင်းဆိုမှု အသစ်</b>\n\n` +
                    `👤 အသုံးပြုသူ: <code>${username}</code>\n` +
                    `💰 ပမာဏ: <b>${amount.toLocaleString()} ကျပ်</b>\n` +
                    `🔢 Txn ID: <code>${txn}</code>`;

    const keyboard = {
        inline_keyboard: [
            [
                { text: '✅ အတည်ပြုမည် (Approve)', callback_data: `approve_dep_${username}_${amount}` },
                { text: '❌ ပယ်ဖျက်မည် (Reject)', callback_data: `reject_dep_${username}` }
            ]
        ]
    };

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: ADMIN_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            reply_markup: keyboard
        });
        res.status(200).json({ success: true, message: 'Telegram သို့ ပို့ပြီးပါပြီ' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post(`/webhook/${TELEGRAM_BOT_TOKEN}`, async (req, res) => {
    const update = req.body;

    if (update.callback_query) {
        const callbackQuery = update.callback_query;
        const data = callbackQuery.data;
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;

        if (data.startsWith('approve_dep_')) {
            const parts = data.split('_');
            const username = parts[2];
            const amount = parts[3];

            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
                chat_id: chatId,
                message_id: messageId,
                text: `✅ <b>ငွေသွင်းမှု အတည်ပြုပြီးပါပြီ။</b>\n👤 အသုံးပြုသူ: ${username}\n💰 ပမာဏ: ${Number(amount).toLocaleString()} ကျပ်`,
                parse_mode: 'HTML'
            });

            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                callback_query_id: callbackQuery.id,
                text: 'ငွေသွင်းမှုကို အတည်ပြုပြီးပါပြီ!'
            });
        }
    }
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
