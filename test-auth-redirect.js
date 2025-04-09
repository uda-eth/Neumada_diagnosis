import http from 'http';

// Test the /api/auth/check endpoint with different Accept headers
function testAuthCheck(acceptHeader) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/check',
      method: 'GET',
      headers: {
        'Accept': acceptHeader
      }
    };

    const req = http.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      
      // Check if there's a redirect
      if (res.statusCode >= 300 && res.statusCode < 400) {
        console.log(`Redirect to: ${res.headers.location}`);
        resolve({ redirected: true, location: res.headers.location });
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('Response data:', jsonData);
          resolve({ redirected: false, data: jsonData });
        } catch (e) {
          console.log('Response (not JSON):', data);
          resolve({ redirected: false, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      reject(error);
    });

    req.end();
  });
}

// Test the /api/user-by-session endpoint with different Accept headers
function testUserBySession(acceptHeader) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/user-by-session',
      method: 'GET',
      headers: {
        'Accept': acceptHeader
      }
    };

    const req = http.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      
      // Check if there's a redirect
      if (res.statusCode >= 300 && res.statusCode < 400) {
        console.log(`Redirect to: ${res.headers.location}`);
        resolve({ redirected: true, location: res.headers.location });
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('Response data:', jsonData);
          resolve({ redirected: false, data: jsonData });
        } catch (e) {
          console.log('Response (not JSON):', data);
          resolve({ redirected: false, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n--------------------------------------------------');
  console.log('Testing /api/auth/check with Accept: text/html');
  console.log('--------------------------------------------------');
  
  await testAuthCheck('text/html');
  
  console.log('\n--------------------------------------------------');
  console.log('Testing /api/auth/check with Accept: application/json');
  console.log('--------------------------------------------------');
  
  await testAuthCheck('application/json');

  console.log('\n--------------------------------------------------');
  console.log('Testing /api/user-by-session with Accept: text/html');
  console.log('--------------------------------------------------');
  
  await testUserBySession('text/html');
  
  console.log('\n--------------------------------------------------');
  console.log('Testing /api/user-by-session with Accept: application/json');
  console.log('--------------------------------------------------');
  
  await testUserBySession('application/json');
}

runTests().catch(console.error);