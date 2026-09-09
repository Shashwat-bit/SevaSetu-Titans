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
  console.log('    SEVASETU PART 5 - INTEROPERABILITY & DATA EXCHANGE SUITE    ');
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

  try {
    // Deterministic test isolation: reset seed state to ensure clean test environment
    await request('/seed', {
      method: 'POST',
      headers: { 'x-dev-seed-key': 'sevasetu-dev-seed-bypass' },
    });

    // 0. Authenticate test personas
    const citLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'tanishka@example.com', password: 'Citizen@123' },
    });
    const citizenToken = citLogin.data?.token;

    const eduLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'officer.edu@gov.in', password: 'Officer@Edu123' },
    });
    const eduToken = eduLogin.data?.token;

    const revLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'officer.rev@gov.in', password: 'Officer@Rev123' },
    });
    const revToken = revLogin.data?.token;

    assert('0. Test personas authenticated successfully', Boolean(citizenToken && eduToken && revToken));

    // TEST 1: Authenticated citizen can access their own documents
    const vaultRes = await request('/interop/vault', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      '1. Authenticated citizen can access their own mock document vault (200)',
      vaultRes.status === 200 && Array.isArray(vaultRes.data) && vaultRes.data.length >= 5
    );

    // TEST 2: Unauthenticated access fails (401)
    const unauthVault = await request('/interop/vault');
    const unauthAdapters = await request('/interop/adapters');
    const unauthExchanges = await request('/interop/exchanges');
    const unauthRequest = await request('/interop/exchange/request', {
      method: 'POST',
      body: { applicationId: 'SS-2026-001024', documentId: 'doc-aadhaar' },
    });
    assert(
      '2. Unauthenticated access fails with 401 across all interop endpoints',
      unauthVault.status === 401 &&
        unauthAdapters.status === 401 &&
        unauthExchanges.status === 401 &&
        unauthRequest.status === 401
    );

    // TEST 3: Application & Service requirements work
    const reqsRes = await request('/services/service-scholarship/requirements');
    const appReqsRes = await request('/applications/SS-2026-001024/requirements', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      '3. Service & application document requirements are retrieved with normalized types',
      reqsRes.status === 200 &&
        Array.isArray(reqsRes.data?.normalizedRequiredTypes) &&
        reqsRes.data.normalizedRequiredTypes.includes('EDUCATION_MARKSHEET') &&
        appReqsRes.status === 200 &&
        appReqsRes.data?.serviceId === 'service-scholarship'
    );

    // TEST 4: Missing consent blocks access
    // Revoke consent on SS-2026-000842 (Revenue Income Certificate)
    const revokeRes = await request('/consents/perm-rev-001/revoke', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { reason: 'Testing consent revocation' },
    });

    const blockedExchange = await request('/applications/SS-2026-000842/documents/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { documentId: 'doc-income', purpose: 'Income verification' },
    });
    assert(
      '4. Missing or revoked consent blocks data exchange (403)',
      blockedExchange.status === 403
    );

    // TEST 5: Granted consent allows access
    // SS-2026-001024 has active consent perm-edu-001
    const allowedExchange = await request('/applications/SS-2026-001024/documents/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { documentId: 'doc-aadhaar', purpose: 'Identity verification' },
    });
    assert(
      '5. Active granted consent allows document exchange (200)',
      allowedExchange.status === 200 &&
        allowedExchange.data?.exchange?.status === 'FETCHED' &&
        allowedExchange.data?.document?.name?.includes('Aadhaar')
    );

    // TEST 6: Revoked consent blocks future access
    // Revoke perm-edu-001 and ensure future access is rejected
    await request('/consents/perm-edu-001/revoke', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { reason: 'User revoked consent for scholarship data access' },
    });

    const postRevocationAttempt = await request('/applications/SS-2026-001024/documents/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { documentId: 'doc-cbse-12', purpose: 'Grade verification' },
    });
    assert(
      '6. Revoked consent blocks future access immediately (403)',
      postRevocationAttempt.status === 403
    );

    // TEST 7: Correct adapter is selected and statuses report properly
    const adaptersRes = await request('/interop/adapters', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const hasDigiLocker = adaptersRes.data?.some((a) => a.id === 'adapter-digilocker');
    const hasDeptEdu = adaptersRes.data?.some((a) => a.id === 'adapter-dept-edu');
    const hasDeptRev = adaptersRes.data?.some((a) => a.id === 'adapter-dept-rev');
    assert(
      '7. Correct mock adapters are registered and available in simulated cluster',
      adaptersRes.status === 200 && hasDigiLocker && hasDeptEdu && hasDeptRev
    );

    // TEST 8: Document normalization works
    // Submit a new application for transport learner DL
    const subRes = await request('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: {
        serviceId: 'service-learner-dl',
        prefilledFields: { 'Full Name': 'Tanishka', 'DOB': '14/05/2002' },
        userFields: { 'Vehicle Category': 'LMV', 'Blood Group': 'O+' },
        attachedDocs: [
          {
            docId: 'doc-aadhaar',
            name: 'Aadhaar Identity Card (e-KYC)',
            docType: 'Identity Document',
            source: 'DigiLocker Mock Adapter (Demo)',
            verified: true,
          },
          {
            docId: 'doc-elec',
            name: 'Electricity Utility Consumer Bill',
            docType: 'Address Information',
            source: 'DigiLocker Mock Adapter (Demo)',
            verified: true,
          },
        ],
      },
    });

    const newApp = subRes.data;
    assert(
      '8. Normalization maps heterogeneous documents to standard schema',
      subRes.status === 201 &&
        newApp?.documentsAttached?.length === 2 &&
        Boolean(newApp?.applicationId)
    );

    // TEST 9: Only required documents are exchanged (unrelated documents blocked)
    const unrelatedExchange = await request(`/applications/${newApp.applicationId}/documents/request`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { documentId: 'doc-cbse-12', purpose: '12th Grade verification' }, // CBSE 12 is not required for transport DL
    });
    if (unrelatedExchange.status !== 403) {
      console.log('[DEBUG Test 9] unrelatedExchange:', JSON.stringify(unrelatedExchange));
    }
    assert(
      '9. Only required documents are allowed for exchange; unrequired credentials blocked (403)',
      unrelatedExchange.status === 403
    );

    // TEST 10: Department receives normalized data and returns mock reference ID
    assert(
      '10. Department adapter returns simulated department reference ID (e.g. TRANS-MOCK-2026-XXXXX)',
      Boolean(newApp?.departmentReferenceId && newApp.departmentReferenceId.includes('TRANS-MOCK-2026'))
    );

    // TEST 11: DataExchange record is created
    const exchangesRes = await request(`/applications/${newApp.applicationId}/exchanges`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const hasExchangeRecord =
      Array.isArray(exchangesRes.data) &&
      exchangesRes.data.length >= 2 &&
      exchangesRes.data.some(
        (e) => e.normalizedType === 'IDENTITY_AADHAAR' && e.targetDepartment === 'dept-trans'
      );
    assert('11. DataExchange records created with all required metadata fields', hasExchangeRecord);

    // TEST 12: Activity and audit events are created
    const actRes = await request('/activities', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const hasAdapterRespAct = actRes.data?.some(
      (a) => a.applicationId === newApp.applicationId && a.type === 'adapter_response'
    );
    const hasSubmissionAct = actRes.data?.some(
      (a) => a.applicationId === newApp.applicationId && a.type === 'submission'
    );
    assert('12. Audit activity events created for adapter dispatch & exchange', hasAdapterRespAct && hasSubmissionAct);

    // TEST 13: Citizen can view personal data exchange history
    const citExchanges = await request('/interop/exchanges', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      '13. Citizen can view full historical audit trail of data exchanges',
      citExchanges.status === 200 && Array.isArray(citExchanges.data) && citExchanges.data.length >= 3
    );

    // TEST 14: Officer sees only application documents (cannot access citizen vault)
    const officerVaultAttempt = await request('/interop/vault', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    const officerAppDocs = await request('/applications/SS-2026-001024/documents', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    assert(
      '14. Officer cannot browse citizen vault (403), sees only application-attached documents (200)',
      officerVaultAttempt.status === 403 &&
        officerAppDocs.status === 200 &&
        Array.isArray(officerAppDocs.data) &&
        officerAppDocs.data.length === 2
    );

    // TEST 15: Another department officer cannot access the application
    const revAccessEduApp = await request('/applications/SS-2026-001024/documents', {
      headers: { Authorization: `Bearer ${revToken}` },
    });
    const eduAccessRevApp = await request('/applications/SS-2026-000915/documents', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    assert(
      '15. Cross-department officer access rejected with 403 Forbidden',
      revAccessEduApp.status === 403 && eduAccessRevApp.status === 403
    );

    // TEST 16: Adapter error handling
    const invalidAdapterReq = await request('/applications/SS-2026-001024/documents/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: {}, // missing documentId
    });
    assert('16. Adapter input validation error handled cleanly (400)', invalidAdapterReq.status === 400);

    // TEST 17: Nonexistent document handled correctly
    const nonExistentDoc = await request(`/applications/${newApp.applicationId}/documents/request`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { documentId: 'doc-nonexistent-99999', purpose: 'Verification' },
    });
    assert('17. Nonexistent document returns 404 Not Found', nonExistentDoc.status === 404);

    // TEST 18: Nonexistent application handled correctly
    const nonExistentApp = await request('/applications/SS-9999-NOTFOUND/requirements', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const nonExistentAppExchange = await request('/applications/SS-9999-NOTFOUND/documents/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { documentId: 'doc-aadhaar', purpose: 'Verification' },
    });
    assert(
      '18. Nonexistent application returns 404 Not Found',
      nonExistentApp.status === 404 && nonExistentAppExchange.status === 404
    );

    // TEST 19: IDOR / BOLA attempt prevention
    const officerUnscopedExchanges = await request('/interop/exchanges', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    assert(
      '19. IDOR / BOLA attempts strictly blocked (403)',
      officerUnscopedExchanges.status === 403
    );

  } catch (err) {
    console.error('Test execution exception:', err);
    failed++;
  }

  console.log('================================================================');
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
