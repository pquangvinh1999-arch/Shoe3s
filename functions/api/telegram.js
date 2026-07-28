export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
      const data = await request.json();
      
      // Lấy Token và Chat ID từ Environment Variables của Cloudflare
      const botToken = env.TELEGRAM_BOT_TOKEN;
      const chatId = env.TELEGRAM_CHAT_ID;
      
      if (!botToken || !chatId) {
          return new Response(JSON.stringify({ error: "Missing Telegram config in Environment Variables" }), { status: 500 });
      }
      
      const message = `🔔 <b>CÓ ĐƠN HÀNG MỚI ĐẶT TỪ LINK LANDING PAGE!</b>\n\n` +
                      `👤 <b>Khách hàng:</b> ${data.customer_name}\n` +
                      `📞 <b>Số điện thoại:</b> ${data.phone}\n` +
                      `🛠 <b>Dịch vụ đặt:</b> ${data.services}\n` +
                      `💰 <b>Tạm tính:</b> ${data.total.toLocaleString()} ₫\n` +
                      `⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`;

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'HTML'
          })
      });
      
      const result = await response.json();
      return new Response(JSON.stringify({ success: true, result }), { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
      });
      
  } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
