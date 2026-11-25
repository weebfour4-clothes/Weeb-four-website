const { getPhonePeUrls, getPhonePeAccessToken, updateOrderStatusInSupabase } = require('./_phonepe');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const merchantOrderId = req.query && req.query.merchantOrderId;
    if (!merchantOrderId) {
      return res.status(400).json({ error: 'merchantOrderId is required' });
    }

    const token = await getPhonePeAccessToken();
    const { statusBaseUrl } = getPhonePeUrls();
    const url = `${statusBaseUrl}/${encodeURIComponent(String(merchantOrderId))}/status?details=false`;

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`
      }
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status || 502).json({
        error: data.message || 'Failed to fetch PhonePe order status',
        details: data
      });
    }

    const state = data.state || 'PENDING';
    if (state === 'COMPLETED') {
      await updateOrderStatusInSupabase(merchantOrderId, 'PAID');
    } else if (state === 'FAILED') {
      await updateOrderStatusInSupabase(merchantOrderId, 'PAYMENT_FAILED');
    }

    return res.status(200).json({
      merchantOrderId,
      orderId: data.orderId,
      state,
      amount: data.amount
    });
  } catch (err) {
    console.error('PhonePe status error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
