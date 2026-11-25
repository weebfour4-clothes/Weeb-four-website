// Shared PhonePe v2 Standard Checkout & Supabase helpers for Vercel Serverless Functions

const DEFAULT_SUPABASE_URL = 'https://lcxsztthumrxnhematle.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjeHN6dHRodW1yeG5oZW1hdGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNTk2MTMsImV4cCI6MjEwNzczNTYxM30.jH3l15TEXGVptqfmKpDPRqAcvi8OGSG3mQF5UOf5xsw';

function getPhonePeUrls() {
  const env = (process.env.PHONEPE_ENV || 'production').toLowerCase();
  if (env === 'sandbox' || env === 'preprod' || env === 'uat') {
    return {
      env: 'sandbox',
      authUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
      payUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay',
      statusBaseUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order'
    };
  }
  return {
    env: 'production',
    authUrl: 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token',
    payUrl: 'https://api.phonepe.com/apis/pg/checkout/v2/pay',
    statusBaseUrl: 'https://api.phonepe.com/apis/pg/checkout/v2/order'
  };
}

async function getPhonePeAccessToken() {
  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1';

  if (!clientId || !clientSecret) {
    throw new Error('Missing PHONEPE_CLIENT_ID or PHONEPE_CLIENT_SECRET in Vercel Environment Variables.');
  }

  const { authUrl } = getPhonePeUrls();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    client_version: clientVersion,
    grant_type: 'client_credentials'
  });

  const resp = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  const data = await resp.json();
  if (!resp.ok || !data.access_token) {
    throw new Error(data.message || data.error_description || 'Failed to obtain PhonePe OAuth token');
  }
  return data.access_token;
}

async function updateOrderStatusInSupabase(merchantOrderId, paymentStatus) {
  const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (!merchantOrderId || !supabaseUrl || !supabaseKey) return;

  try {
    await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(merchantOrderId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ payment_status: paymentStatus })
    });
  } catch (err) {
    console.warn('Supabase order status update warning:', err.message);
  }
}

module.exports = {
  getPhonePeUrls,
  getPhonePeAccessToken,
  updateOrderStatusInSupabase
};
