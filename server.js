// Telegram တွင် ခလုတ်နှိပ်ခြင်းကို လက်ခံဆောင်ရွက်ရန် (Updated)
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;

    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;
      const originalText = callbackQuery.message.text;

      // ပထမဦးစွာ Telegram ကို callback query လက်ခံရရှိကြောင်း ချက်ချင်း အကြောင်းပြန်ပါ (Error မတက်စေရန်)
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
        callback_query_id: callbackQuery.id,
        text: data === 'approve' ? '✅ ငွေသွင်းမှုကို အတည်ပြုပြီးပါပြီ။' : '❌ ငွေသွင်းတောင်းဆိုမှုကို ငြင်းပယ်လိုက်ပါပြီ။'
      });

      // မက်ဆေ့ချ်စာသားကို ပြောင်းလဲခြင်း
      const statusText = data === 'approve' ? 
        `\n\n<b>STATUS: ✅ ငွေသွင်းအတည်ပြုပြီးပါပြီ</b>` : 
        `\n\n<b>STATUS: ❌ ငွေသွင်းငြင်းပယ်လိုက်ပါပြီ</b>`;

      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
        chat_id: chatId,
        message_id: messageId,
        text: originalText + statusText,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [] } // ခလုတ်များကို ဖယ်ရှားပစ်ခြင်း
      });
    }
  } catch (err) {
    console.error('Webhook Error:', err.message);
  }

  return res.status(200).send('OK');
});
