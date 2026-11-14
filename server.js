import axios from 'axios';

const TOKEN = '9271299773:AAGN3Yr7uRZfEemhaxqK-7aPUUFQx8Lusdw';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const q = req.body?.callback_query;
      if (q) {
        await axios.post(`https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`, {
          callback_query_id: q.id,
          text: 'အောင်မြင်ပါပြီ'
        });
        await axios.post(`https://api.telegram.org/bot${TOKEN}/editMessageText`, {
          chat_id: q.message.chat.id,
          message_id: q.message.message_id,
          text: q.message.text + '\n\n<b>STATUS: ✅ ပြီးစီးပါပြီ</b>',
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [] }
        });
      }
    } catch (e) {
      console.error(e);
    }
    return res.status(200).send('OK');
  }

  return res.status(200).send('Bot is active');
}
