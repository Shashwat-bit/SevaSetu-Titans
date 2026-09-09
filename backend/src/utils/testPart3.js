const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          const unwrapped =
            parsed && typeof parsed === 'object' && 'data' in parsed && parsed.data !== undefined
              ? parsed.data
              : parsed;
          resolve({ status: res.statusCode, body: parsed, data: unwrapped });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  console.log('================================================================');
  console.log('       SEVASETU PART 3 - AUTOMATED SECURITY TEST SUITE         ');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`\x1b[32m[PASS]\x1b[0m ${name}`);
      passed++;
    } else {
      console.log(`\x1b[31m[FAIL]\x1b[0m ${name} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  // Deterministic test isolation: reset seed state to ensure clean test environment
  await request('/seed', {
    method: 'POST',
    headers: { 'x-dev-seed-key': 'sevasetu-dev-seed-bypass' },
  });

  // 1. Citizen Login
  const loginCitizen = await request('/auth/login', {
    method: 'POST',
    body: { email: 'tanishka@example.com', password: 'Citizen@123' },
  });
  const citizenToken = loginCitizen.data?.token;
  assert(
    '1. Login succeeds with demo citizen',
    loginCitizen.status === 200 && citizenToken && loginCitizen.data?.user?.role === 'citizen',
    JSON.stringify(loginCitizen.body)
  );

  // 2. Officer Login
  const loginOfficer = await request('/auth/login', {
    method: 'POST',
    body: { email: 'officer.edu@gov.in', password: 'Officer@Edu123' },
  });
  const officerToken = loginOfficer.data?.token;
  assert(
    '2. Login succeeds with demo officer',
    loginOfficer.status === 200 &&
      officerToken &&
      loginOfficer.data?.user?.role === 'officer' &&
      loginOfficer.data?.user?.departmentId === 'dept-edu',
    JSON.stringify(loginOfficer.body)
  );

  // 3. Invalid password fails with 401
  const invalidLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'tanishka@example.com', password: 'WrongPassword' },
  });
  assert('3. Invalid password fails with 401', invalidLogin.status === 401);

  // 4. Missing token receives 401
  const noToken = await request('/applications');
  assert('4. Missing token receives 401', noToken.status === 401);

  // 5. Citizen can access own applications
  const citApps = await request('/applications', {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert(
    '5. Citizen can access own applications',
    citApps.status === 200 && Array.isArray(citApps.data) && citApps.data.length > 0
  );

  // 6. Citizen cannot access another citizen's application / query spoofing
  const spoofQuery = await request('/applications?citizenId=cit-other-999', {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  const allMine = Array.isArray(spoofQuery.data) && spoofQuery.data.every((a) => a.citizenId === 'cit-001');
  assert('6. Citizen cannot query other citizen applications (ownership enforced)', spoofQuery.status === 200 && allMine);

  // 7. Citizen cannot advance application status (403)
  const citAdvance = await request('/applications/SS-2026-001024', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: {},
  });
  assert('7. Citizen cannot advance application status (403)', citAdvance.status === 403);

  // 8. Officer can access applications in their department
  const offApps = await request('/applications', {
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  const allEdu = Array.isArray(offApps.data) && offApps.data.every((a) => a.departmentId === 'dept-edu');
  assert(
    '8. Officer can access applications in their department',
    offApps.status === 200 && Array.isArray(offApps.data) && allEdu
  );

  // 9. Education officer cannot modify Revenue department applications (403)
  const crossDept = await request('/applications/SS-2026-000842', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${officerToken}` },
    body: {},
  });
  assert('9. Education officer cannot modify Revenue application (403)', crossDept.status === 403);

  // 10. Officer can advance a matching department application
  const offAdvance = await request('/applications/SS-2026-001024', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${officerToken}` },
    body: {},
  });
  assert(
    '10. Officer can advance a matching department application',
    offAdvance.status === 200 && offAdvance.data?.status !== undefined
  );

  // 11. Citizen can view own consent
  const consents = await request('/consents', {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert('11. Citizen can view own consents', consents.status === 200 && Array.isArray(consents.data));

  // 12. Officer cannot revoke citizen consent (403)
  const offRevoke = await request('/consents/perm-edu-001/revoke', {
    method: 'POST',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert('12. Officer cannot revoke citizen consent (403)', offRevoke.status === 403);

  // 13. Citizen can revoke own consent
  const citRevoke = await request('/consents/perm-edu-001/revoke', {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert(
    '13. Citizen can revoke own consent',
    citRevoke.status === 200 &&
      (citRevoke.data?.status === 'Access Revoked' || citRevoke.data?.status === 'Revoked')
  );

  // 14. Citizen can access own documents
  const citDocs = await request('/documents', {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert('14. Citizen can access own documents', citDocs.status === 200 && Array.isArray(citDocs.data));

  // 15. Anonymous user cannot access protected personal data (401)
  const anonActivities = await request('/activities');
  assert('15. Anonymous user cannot access activities (401)', anonActivities.status === 401);

  // 16. /api/seed is protected against non-admin (403)
  const nonAdminSeed = await request('/seed', {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert('16. /api/seed is protected against non-admin (403)', nonAdminSeed.status === 403);

  // 17. Demo persona switching returns a real JWT
  const demoSwitch = await request('/auth/demo-switch', {
    method: 'POST',
    body: { persona: 'officer-trans' },
  });
  assert(
    '17. Demo persona switching returns a real JWT',
    demoSwitch.status === 200 &&
      demoSwitch.data?.token &&
      demoSwitch.data?.user?.departmentId === 'dept-trans'
  );

  console.log('================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
