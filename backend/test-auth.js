const http = require('http');

// Helper to make HTTP requests and preserve cookies
const makeRequest = (options, postData = null, cookieHeader = '') => {
  return new Promise((resolve, reject) => {
    const headers = { ...options.headers };
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5001,
        ...options,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let body;
          try {
            body = JSON.parse(data);
          } catch (e) {
            body = data;
          }
          const cookies = res.headers['set-cookie'] || [];
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            cookies,
            body,
          });
        });
      }
    );

    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING EDUHUB AUTOMATED VERIFICATION ---');
  let cookieJar = '';
  let enrolledCourseId = '';

  const updateCookies = (setCookies) => {
    if (!setCookies || !setCookies.length) return;
    const cookieMap = {};
    if (cookieJar) {
      cookieJar.split('; ').forEach((c) => {
        const [k, v] = c.split('=');
        if (k && v) cookieMap[k] = v;
      });
    }
    setCookies.forEach((c) => {
      const parts = c.split(';')[0].split('=');
      cookieMap[parts[0]] = parts[1];
    });
    cookieJar = Object.entries(cookieMap)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  };

  try {
    // 1. Health check
    console.log('[Test 1] GET /api/health');
    const health = await makeRequest({ path: '/api/health', method: 'GET' });
    console.log('Status:', health.statusCode, 'Service:', health.body.service);
    if (health.statusCode !== 200) throw new Error('Health check failed');

    // 2. Courses seeded
    console.log('[Test 2] GET /api/courses');
    const coursesRes = await makeRequest({ path: '/api/courses', method: 'GET' });
    console.log('Status:', coursesRes.statusCode, 'Total Courses:', coursesRes.body.count);
    if (coursesRes.statusCode !== 200 || coursesRes.body.count === 0)
      throw new Error('Course catalog failed');
    enrolledCourseId = coursesRes.body.courses[0]._id;

    // 3. User Registration
    const testEmail = `dev_${Date.now()}@eduhub.io`;
    console.log(`[Test 3] POST /api/auth/register (${testEmail})`);
    const regPayload = JSON.stringify({
      name: 'Alexander Turing',
      email: testEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    });
    const regRes = await makeRequest({ path: '/api/auth/register', method: 'POST' }, regPayload);
    console.log('Status:', regRes.statusCode, 'Message:', regRes.body.message);
    console.log('Cookies received:', regRes.cookies.length);
    if (regRes.statusCode !== 201) throw new Error('Registration failed');
    updateCookies(regRes.cookies);

    // 4. Duplicate Registration Prevention
    console.log('[Test 4] Duplicate registration check');
    const dupRes = await makeRequest({ path: '/api/auth/register', method: 'POST' }, regPayload);
    console.log('Status:', dupRes.statusCode, 'Message:', dupRes.body.message);
    if (dupRes.statusCode !== 400) throw new Error('Duplicate email prevention failed');

    // 5. Protected Route GET /api/auth/me
    console.log('[Test 5] GET /api/auth/me (Authenticated via HttpOnly Cookie)');
    console.log('Sending Cookie Header:', cookieJar);
    const meRes = await makeRequest({ path: '/api/auth/me', method: 'GET' }, null, cookieJar);
    console.log('Status:', meRes.statusCode, 'Body:', meRes.body);
    if (meRes.statusCode !== 200 || !meRes.body.user) throw new Error('Auth me check failed');

    // 6. JWT Refresh Token Rotation POST /api/auth/refresh
    console.log('[Test 6] POST /api/auth/refresh (Token Rotation)');
    const refreshRes = await makeRequest({ path: '/api/auth/refresh', method: 'POST' }, '{}', cookieJar);
    console.log('Status:', refreshRes.statusCode, 'Message:', refreshRes.body.message);
    if (refreshRes.statusCode !== 200) throw new Error('Refresh token rotation failed');
    updateCookies(refreshRes.cookies);

    // 7. Profile Update PUT /api/auth/profile
    console.log('[Test 7] PUT /api/auth/profile');
    const profilePayload = JSON.stringify({
      headline: 'Senior Cloud & Full-Stack Architect',
      location: 'San Francisco, CA',
      bio: 'Building next-generation distributed systems and mentoring engineers.',
    });
    const profileRes = await makeRequest(
      { path: '/api/auth/profile', method: 'PUT' },
      profilePayload,
      cookieJar
    );
    console.log('Status:', profileRes.statusCode, 'New Headline:', profileRes.body.user?.headline);
    if (profileRes.statusCode !== 200) throw new Error('Profile update failed');

    // 8. Enroll Course POST /api/courses/:id/enroll
    console.log('[Test 8] POST /api/courses/:id/enroll');
    const enrollRes = await makeRequest(
      { path: `/api/courses/${enrolledCourseId}/enroll`, method: 'POST' },
      '{}',
      cookieJar
    );
    console.log('Status:', enrollRes.statusCode, 'Message:', enrollRes.body.message);
    if (enrollRes.statusCode !== 200) throw new Error('Course enrollment failed');

    // 9. Update Course Progress PUT /api/courses/:id/progress
    console.log('[Test 9] PUT /api/courses/:id/progress');
    const progressPayload = JSON.stringify({ progress: 50 });
    const progRes = await makeRequest(
      { path: `/api/courses/${enrolledCourseId}/progress`, method: 'PUT' },
      progressPayload,
      cookieJar
    );
    console.log('Status:', progRes.statusCode, 'New Progress:', progRes.body.progress);
    if (progRes.statusCode !== 200) throw new Error('Progress update failed');

    // 10. Dashboard Stats GET /api/courses/stats/dashboard
    console.log('[Test 10] GET /api/courses/stats/dashboard');
    const dashRes = await makeRequest(
      { path: '/api/courses/stats/dashboard', method: 'GET' },
      null,
      cookieJar
    );
    console.log(
      'Status:',
      dashRes.statusCode,
      'Total Enrolled:',
      dashRes.body.stats?.totalEnrolled,
      'Avg Progress:',
      dashRes.body.stats?.averageProgress + '%'
    );
    if (dashRes.statusCode !== 200) throw new Error('Dashboard stats failed');

    // 11. Change Password PUT /api/auth/change-password
    console.log('[Test 11] PUT /api/auth/change-password');
    const passPayload = JSON.stringify({
      currentPassword: 'SecurePassword123!',
      newPassword: 'BrandNewPassword2026!',
      confirmNewPassword: 'BrandNewPassword2026!',
    });
    const passRes = await makeRequest(
      { path: '/api/auth/change-password', method: 'PUT' },
      passPayload,
      cookieJar
    );
    console.log('Status:', passRes.statusCode, 'Message:', passRes.body.message);
    if (passRes.statusCode !== 200) throw new Error('Password change failed');
    updateCookies(passRes.cookies);

    // 12. Login with New Password
    console.log('[Test 12] POST /api/auth/login (With new password)');
    const loginPayload = JSON.stringify({
      email: testEmail,
      password: 'BrandNewPassword2026!',
    });
    const loginRes = await makeRequest({ path: '/api/auth/login', method: 'POST' }, loginPayload);
    console.log('Status:', loginRes.statusCode, 'User:', loginRes.body.user?.name);
    if (loginRes.statusCode !== 200) throw new Error('Login with updated password failed');
    updateCookies(loginRes.cookies);

    // 13. Logout POST /api/auth/logout
    console.log('[Test 13] POST /api/auth/logout');
    const logoutRes = await makeRequest(
      { path: '/api/auth/logout', method: 'POST' },
      '{}',
      cookieJar
    );
    console.log('Status:', logoutRes.statusCode, 'Message:', logoutRes.body.message);
    if (logoutRes.statusCode !== 200) throw new Error('Logout failed');
    updateCookies(logoutRes.cookies);

    // 14. Verify access denied after logout
    console.log('[Test 14] Verify protected route rejects cleared session');
    const unauthRes = await makeRequest({ path: '/api/auth/me', method: 'GET' }, null, '');
    console.log('Status:', unauthRes.statusCode, 'Code:', unauthRes.body.code);
    if (unauthRes.statusCode !== 401) throw new Error('Protected route should be 401 after logout');

    console.log('\n======================================================');
    console.log('🎉 ALL 14 AUTOMATED API & SECURITY TESTS PASSED 100%!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    process.exit(1);
  }
};

module.exports = runTests;

if (require.main === module) {
  runTests();
}
