const http = require('http');

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`\n✅ ${method} ${path} Response:`, responseData);
        resolve(responseData);
      });
    });

    req.on('error', (error) => {
      console.error(`\n❌ ${method} ${path} Error:`, error.message);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test health endpoint
console.log('🔵 Testing health endpoint...');
makeRequest('/health')
  .then(() => {
    console.log('\n🔵 Testing registration...');
    return makeRequest('/auth/register', 'POST', {
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'test123',
      role: 'patient'
    });
  })
  .catch(console.error);