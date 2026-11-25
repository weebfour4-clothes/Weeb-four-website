const crypto = require('crypto');
const { updateOrderStatusInSupabase } = require('./_phonepe');

module.exports = async function handler(req, res) {
  // Always allow PhonePe webhook POST notifications
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'WEEBFOUR PhonePe Webhook Active' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify PhonePe Basic SHA256 Authorization header if credentials are configured
    const webhookUser = process.env.PHONEPE_WEBHOOK_USERNAME;
    const webhookPass = process.env.PHONEPE_WEBHOOK_PASSWORD;
    if (webhookUser && webhookPass) {
      const expectedHash = crypto
        .createHash('sha256')
        .update(`${webhookUser}:${webhookPass}`)
        .digest('hex');
      const incomingAuth = (req.headers['authorization'] || '').trim();
      if (incomingAuth !== expectedHash) {
        return res.status(401).json({ error: 'Invalid webhook authorization signature' });
      }
    }

    const body = req.body || {};
    const payload = body.payload || {};
    const merchantOrderId = payload.merchantOrderId || payload.originalMerchantOrderId;
    const state = payload.state;

    if (merchantOrderId && state) {
      if (state === 'COMPLETED') {
        await updateOrderStatusInSupabase(merchantOrderId, 'PAID');
      } else if (state === 'FAILED') {
        await updateOrderStatusInSupabase(merchantOrderId, 'PAYMENT_FAILED');
      }
    }

    return res.status(200).json({ received: true, merchantOrderId: merchantOrderId || null, state: state || null });
  } catch (err) {
    console.error('PhonePe webhook error:', err);
    return res.status(200).json({ received: true, warning: err.message });
  }
};
