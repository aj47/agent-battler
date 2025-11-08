// Test if Node.js respects HTTP_PROXY
const https = require('https');
const http = require('http');

console.log('Environment variables:');
console.log('HTTP_PROXY:', process.env.HTTP_PROXY);
console.log('HTTPS_PROXY:', process.env.HTTPS_PROXY);

// Test with a simple HTTPS request
const options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js Test'
  }
};

console.log('\nMaking HTTPS request to api.github.com...');

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();

