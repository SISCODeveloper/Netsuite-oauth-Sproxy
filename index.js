const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Hardcoded NetSuite Suitelet URL
const TARGET_URL = 'https://8869626.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=2239&deploy=1&compid=8869626&ns-at=AAEJ7tMQWqfayGlovA_0cQpw0pkkSJj8L7hOYASVjnO86mffWDA';

app.get('/', (req, res) => {
  res.status(200).send('✅ New NetSuite Proxy is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Proxy is awake',
    time: new Date().toISOString()
  });
});

app.all('/test', (req, res) => {
  console.log('🧪 TEST endpoint hit');
  console.log('Method:', req.method);
  console.log('Body:', req.body);

  res.status(200).json({
    success: true,
    message: 'Render test endpoint reached',
    method: req.method,
    body: req.body
  });
});

app.post('/clean', async (req, res) => {
  console.log('🔥 /clean endpoint hit');
  console.log('📥 Body received:', JSON.stringify(req.body, null, 2));

  try {
    const response = await axios({
      url: TARGET_URL,
      method: 'POST',
      data: req.body,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    console.log('✅ NetSuite response:', response.data);

    res.status(200).json({
      success: true,
      message: 'Successfully forwarded to NetSuite',
      netsuiteResponse: response.data
    });

  } catch (error) {
    console.error('❌ Error forwarding to NetSuite:', error.message);
    console.error('❌ NetSuite status:', error.response?.status);
    console.error('❌ NetSuite detail:', error.response?.data);

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Render was hit, but NetSuite forwarding failed',
      error: error.message,
      netsuiteStatus: error.response?.status || null,
      netsuiteDetail: error.response?.data || null
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 New proxy running on port ${PORT}`);
});