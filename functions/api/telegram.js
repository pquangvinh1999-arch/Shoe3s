export function escapeTelegramHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendTelegramOrderNotification(data, env) {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    return { sent: false, reason: 'missing-config' };
  }

  const message =
    `🔔 <b>CÓ ĐƠN HÀNG MỚI ĐẶT TỪ LINK LANDING PAGE!</b>\n\n` +
    `👤 <b>Khách hàng:</b> ${escapeTelegramHtml(data.customer_name)}\n` +
    `📞 <b>Số điện thoại:</b> ${escapeTelegramHtml(data.phone)}\n` +
    `🛠 <b>Dịch vụ đặt:</b> ${escapeTelegramHtml(data.services)}\n` +
    `💰 <b>Tạm tính:</b> ${Number(data.total || 0).toLocaleString('vi-VN')} ₫\n` +
    `⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    return { sent: response.ok, status: response.status };
  } catch {
    return { sent: false, reason: 'network-error' };
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await sendTelegramOrderNotification(data, env);
  if (!result.sent) {
    return new Response(JSON.stringify({ error: 'Telegram notification failed' }), {
      status: result.reason === 'missing-config' ? 500 : 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
