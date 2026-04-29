const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('✅ NetSuite Proxy is running. POST to /netsuite');
});

app.post('/netsuite', async (req, res) => {
  try {
    console.log('Incoming Body:', req.body);

    if (!process.env.TARGET_URL) {
      return res.status(500).json({
        success: false,
        error: 'TARGET_URL environment variable is not set'
      });
    }

    const data = {
      client: req.body.client || req.body.input_1 || '',
      project: req.body.project || req.body.input_2 || '',
      amount: req.body.amount || req.body.input_3 || '',
      raw: req.body
    };

    const response = await axios.post(process.env.TARGET_URL, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    res.json({
      success: true,
      netsuite: response.data
    });

  } catch (err) {
    console.error('Error:', err.response?.data || err.message);

    res.status(err.response?.status || 500).json({
      success: false,
      error: err.message,
      detail: err.response?.data || 'Request to NetSuite failed'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Running on port ${PORT}`));
