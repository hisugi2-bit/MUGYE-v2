// Vercel Serverless Function for sending MUGYE Order notification emails via Resend
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    customerName,
    customerPhone,
    customerAddress,
    customerNote,
    gakjiType,
    gakjiMaterial,
    circumference,
    thumbWidth,
    thumbThickness
  } = req.body;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('RESEND_API_KEY environment variable is not configured.');
    return res.status(500).json({ error: 'Resend API key is missing' });
  }

  const emailContent = `
    <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #c5a880; border-radius: 8px; padding: 30px; background-color: #121213; color: #e5e5e5;">
      <h2 style="color: #c5a880; border-bottom: 2px solid #c5a880; padding-bottom: 10px; margin-top: 0;">
        [무계 (無界)] 수제 깍지 신규 주문 접수
      </h2>
      
      <h3 style="color: #ffffff; margin-top: 25px;">1. 주문자 인적사항</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 8px; color: #a0a0a0; width: 120px;">성명:</td><td style="padding: 8px; color: #ffffff; font-weight: bold;">${customerName}</td></tr>
        <tr><td style="padding: 8px; color: #a0a0a0;">연락처:</td><td style="padding: 8px; color: #c5a880; font-weight: bold;">${customerPhone}</td></tr>
        <tr><td style="padding: 8px; color: #a0a0a0;">배송 주소:</td><td style="padding: 8px; color: #ffffff;">${customerAddress}</td></tr>
      </table>

      <h3 style="color: #ffffff; margin-top: 25px;">2. 맞춤 제작 옵션</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 8px; color: #a0a0a0; width: 120px;">깍지 종류:</td><td style="padding: 8px; color: #c5a880; font-weight: bold;">${gakjiType}</td></tr>
        <tr><td style="padding: 8px; color: #a0a0a0;">제작 소재:</td><td style="padding: 8px; color: #ffffff; font-weight: bold;">${gakjiMaterial}</td></tr>
      </table>

      <h3 style="color: #ffffff; margin-top: 25px;">3. 측정 치수</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 8px; color: #a0a0a0; width: 120px;">마디 둘레:</td><td style="padding: 8px; color: #ffffff;">${circumference ? circumference + ' mm' : '미입력'}</td></tr>
        <tr><td style="padding: 8px; color: #a0a0a0;">마디 너비(좌우):</td><td style="padding: 8px; color: #ffffff;">${thumbWidth ? thumbWidth + ' mm' : '미입력'}</td></tr>
        <tr><td style="padding: 8px; color: #a0a0a0;">마디 두께(상하):</td><td style="padding: 8px; color: #ffffff;">${thumbThickness ? thumbThickness + ' mm' : '미입력'}</td></tr>
      </table>

      <h3 style="color: #ffffff; margin-top: 25px;">4. 특이사항 및 요청사항</h3>
      <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 4px; color: #d0d0d0; line-height: 1.6;">
        ${customerNote ? customerNote.replace(/\n/g, '<br>') : '요청사항 없음'}
      </div>

      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid rgba(197, 168, 128, 0.2); font-size: 0.85rem; color: #888888; text-align: center;">
        본 메일은 무계(無界) 공식 랜딩페이지 주문서 제출을 통해 자동 발송되었습니다.
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: '무계 주문접수 <onboarding@resend.dev>',
        to: ['retrodio1914@gmail.com'],
        subject: `[무계 깍지 주문] ${customerName}님의 수제 맞춤 신청서`,
        html: emailContent
      })
    });

    const data = await response.json();
    if (response.ok) {
      return res.status(200).json({ success: true, data });
    } else {
      console.error('Resend API Error:', data);
      return res.status(response.status).json({ error: data });
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message });
  }
}
