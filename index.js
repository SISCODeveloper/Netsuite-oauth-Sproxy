const express = require('express');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// OAuth Setup (HMAC-SHA256)
const oauth = OAuth({
  consumer: {
    key: process.env.CONSUMER_KEY,
    secret: process.env.CONSUMER_SECRET
  },
  signature_method: 'HMAC-SHA256',
  hash_function(base, key) {
    return crypto.createHmac('sha256', key).update(base).digest('base64');
  }
});

const token = {
  key: process.env.TOKEN,
  secret: process.env.TOKEN_SECRET
};

app.post('/netsuite', async (req, res) => {
  try {
    // Step 1: Filter or transform data (customize as needed)
    const filteredData = {
      client: req.body.client,
      project: req.body.project,
      amount: req.body.amount
    };

    // Step 2: Prepare OAuth header
    const requestData = {
      url: process.env.TARGET_URL,
      method: 'POST',
      data: filteredData
    };

    const oauthHeader = oauth.toHeader(oauth.authorize(requestData, token));

    // Step 3: Send to NetSuite
    const response = await axios({
      url: requestData.url,
      method: 'POST',
      data: filteredData,
      headers: {
        ...oauthHeader,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(err.response?.status || 500).json({
      error: err.message,
      detail: err.response?.data || 'Request failed'
    });
  }
});

app.get('/', (req, res) => {
  res.send('✅ NetSuite OAuth Proxy is running. POST to /netsuite');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
