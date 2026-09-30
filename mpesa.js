// mpesa.js - Reusable M-Pesa Daraja STK Push
// Works for Shambalens, ShambaHire, 6to6

const axios = require('axios');

async function getAccessToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  
  const res = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return res.data.access_token;
}

async function stkPush({ phone, amount, accountRef, desc }) {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0,14);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE, // e.g. 174379
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone, // 254712000000
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.CALLBACK_URL, // your Supabase function URL
    AccountReference: accountRef, // e.g. "ShambaHire-Booking-123"
    TransactionDesc: desc
  };

  const res = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// USAGE EXAMPLES:
// ShambaHire: stkPush({phone:"254712000000", amount:2500, accountRef:"ShambaHire-2Acres", desc:"Tractor deposit"})
// 6to6: stkPush({phone:"254711111111", amount:3000, accountRef:"6to6-ADV-4hrs", desc:"Bike rental"})
// Shambalens: stkPush({phone:"254700000000", amount:500, accountRef:"Shambalens-Premium", desc:"Premium monthly"})

module.exports = { stkPush };