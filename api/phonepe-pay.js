const { getPhonePeUrls, getPhonePeAccessToken } = require('./_phonepe');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { merchantOrderId, amountInINR, redirectUrl, customerName, customerPhone } = req.body || {};

    if (!merchantOrderId || !amountInINR || Number(amountInINR) <= 0 || !redirectUrl) {
      return res.status(400).json({ error: 'Missing required payment fields (merchantOrderId, amountInINR, redirectUrl).' });
    }

    const token = await getPhonePeAccessToken();
    const { payUrl } = getPhonePeUrls();
    const amountInPaise = Math.round(Number(amountInINR) * 100);

    const payload = {
      merchantOrderId: String(merchantOrderId),
      amount: amountInPaise,
      expireAfter: 1200,
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: `WEEBFOUR Order #${merchantOrderId}`,
        merchantUrls: {
          redirectUrl: String(redirectUrl)
        }
      },
      metaInfo: {
        udf1: customerName ? String(customerName).slice(0, 60) : 'WEEBFOUR Customer',
        udf2: customerPhone ? String(customerPhone).slice(0, 20) : ''
      }
    };

    const resp = await fetch(payUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    if (!resp.ok || !data.redirectUrl) {
      return res.status(resp.status || 502).json({
        error: data.message || 'PhonePe checkout creation failed',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      orderId: data.orderId,
      state: data.state,
      redirectUrl: data.redirectUrl
    });
  } catch (err) {
    console.error('PhonePe pay error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
