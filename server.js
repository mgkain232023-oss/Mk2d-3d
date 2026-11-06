const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname)));

const TELEGRAM_BOT_TOKEN = "9271299773:AAGN3Yr7uRZfEemhaxqK-7aPUUFQx8Lusdw";
const ADMIN_CHAT_ID = "9274490522";

// ဝဘ်ဆိုက်မှ ငွေသွင်းတောင်းဆိုချက် လက်ခံခြင်း
app.post('/api/deposit', async (req, res) => {
  try {
    const { username, amount, phone, paymentMethod } = req.body;

    const message = `📥 <b>ငွေသွင်းတောင်းဆိုမှု အသစ်</b>\n\n` +
                    `👤 အမည်: ${username}\n` +
                    `💰 ပမာဏ: ${amount.toLocaleString()} ကျပ်\n` +
                    `📞 ဖုန်းနံပါတ်: ${phone}\n` +
                    `💳 နည်းလမ်း: ${paymentMethod}`;

    // Callback data တွင် အချက်အလက်များကို ရိုးရှင်းစွာ ပေးပို့ခြင်း
    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ အတည်ပြုမည်', callback_data: `approve` },
          { text: '❌ ငြင်းပယ်မည်', callback_data: `reject` }
        ]
      ]
    };

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: ADMIN_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
      reply_markup: keyboard
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('API Deposit Error:', error.message);
    res.status(500).json({ success: false });
  }
});

// Telegram တွင် ခလုတ်နှိပ်ခြင်းကို လက်ခံဆောင်ရွက်ရန်
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;

    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;
      const originalText = callbackQuery.message.text;

      if (data === 'approve') {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
          chat_id: chatId,
          message_id: messageId,
          text: originalText + `\n\n<b>STATUS: ✅ ငွေသွင်းအတည်ပြုပြီးပါပြီ</b>`,
          parse_mode: 'HTML'
        });

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          callback_query_id: callbackQuery.id,
          text: `✅ ငွေသွင်းမှုကို အတည်ပြုပြီးပါပြီ။`
        });

      } else if (data === 'reject') {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
          chat_id: chatId,
          message_id: messageId,
          text: originalText + `\n\n<b>STATUS: ❌ ငွေသွင်းငြင်းပယ်လိုက်ပါပြီ</b>`,
          parse_mode: 'HTML'
        });

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          callback_query_id: callbackQuery.id,
          text: `❌ ငွေသွင်းတောင်းဆိုမှုကို ငြင်းပယ်လိုက်ပါပြီ။`
        });
      }
    }
  } catch (err) {
    console.error('Webhook Error:', err.message);
  }

  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
