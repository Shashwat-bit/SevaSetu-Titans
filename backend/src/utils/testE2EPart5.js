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
  console.log('       SEVASETU PART 5 - END-TO-END INTEROPERABILITY FLOW       ');
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

    // 1. Citizen logs in
    const citAuth = await request('/auth/login', {
      method: 'POST',
      body: { email: 'tanishka@example.com', password: 'Citizen@123' },
    });
    const citizenToken = citAuth.data?.token;
    assert('E2E-1: Citizen logs in and gets JWT token', Boolean(citizenToken));

    // 2. Citizen accesses DigiLocker mock vault
    const vault = await request('/interop/vault', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      'E2E-2: Citizen browses personal mock credential vault',
      vault.status === 200 && Array.isArray(vault.data) && vault.data.length >= 6
    );

    // 3. Citizen checks service requirements
    const reqs = await request('/services/service-scholarship/requirements');
    assert(
      'E2E-3: Citizen checks service requirements and normalized document types',
      reqs.status === 200 && reqs.data?.requiredDocuments?.length > 0
    );

    // 4. Citizen submits application with attached verified credentials
    const submitRes = await request('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: {
        serviceId: 'service-scholarship',
        prefilledFields: {
          'Full Name': 'Tanishka',
          'Aadhaar Number': 'XXXX-XXXX-4921',
        },
        userFields: {
          'College Name': 'Gujarat Technological University',
          'Course & Year': 'B.Tech IT - 4th Year',
          'Family Annual Income': '180000',
        },
        attachedDocs: [
          {
            docId: 'doc-aadhaar',
            name: 'Aadhaar Identity Card (e-KYC)',
            docType: 'Identity Document',
            source: 'DigiLocker Mock Adapter (Demo)',
            verified: true,
          },
          {
            docId: 'doc-cbse-12',
            name: 'Class XII Senior School Marksheet',
            docType: 'Marksheet',
            source: 'DigiLocker Mock Adapter (Demo)',
            verified: true,
          },
        ],
      },
    });

    const application = submitRes.data;
    assert(
      'E2E-4: Application submitted, mock adapter dispatched, reference ID generated',
      submitRes.status === 201 &&
        Boolean(application?.applicationId) &&
        Boolean(application?.departmentReferenceId?.startsWith('EDU-MOCK-2026'))
    );

    // 5. Check linked DataExchange records
    const exchanges = await request(`/applications/${application.applicationId}/exchanges`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      'E2E-5: Linked DataExchange audit records created for submitted documents',
      exchanges.status === 200 &&
        Array.isArray(exchanges.data) &&
        exchanges.data.length === 2 &&
        exchanges.data[0].targetDepartment === 'dept-edu'
    );

    // 6. Officer logs in
    const officerAuth = await request('/auth/login', {
      method: 'POST',
      body: { email: 'officer.edu@gov.in', password: 'Officer@Edu123' },
    });
    const officerToken = officerAuth.data?.token;
    assert('E2E-6: Education Officer logs in', Boolean(officerToken));

    // 7. Officer checks application details & documents
    const officerAppDocs = await request(`/applications/${application.applicationId}/documents`, {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    assert(
      'E2E-7: Officer retrieves only application-specific documents',
      officerAppDocs.status === 200 &&
        Array.isArray(officerAppDocs.data) &&
        officerAppDocs.data.length === 2
    );

    // 8. Officer cannot access citizen vault
    const officerVaultBlock = await request('/interop/vault', {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    assert('E2E-8: Officer is forbidden from accessing citizen vault (403)', officerVaultBlock.status === 403);

    // 9. Officer verifies document
    const verifyDocRes = await request(`/officer/applications/${application.applicationId}/documents/doc-cbse-12/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: {},
    });
    assert(
      'E2E-9: Officer verifies CBSE Class XII Marksheet credential',
      verifyDocRes.status === 200 &&
        (verifyDocRes.data?.verificationStatus === 'VERIFIED' || verifyDocRes.data?.document?.verificationStatus === 'VERIFIED')
    );

    // 10. Advance status to Under Verification
    const advanceRes = await request(`/officer/applications/${application.applicationId}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: {
        status: 'Under Verification',
        reason: 'Documents verified via DigiLocker Mock Adapter',
      },
    });
    assert(
      'E2E-10: Application status updated through official workflow',
      advanceRes.status === 200 && advanceRes.data?.status === 'Under Verification'
    );

    // 11. Cross-department officer is blocked
    const revOfficerAuth = await request('/auth/login', {
      method: 'POST',
      body: { email: 'officer.rev@gov.in', password: 'Officer@Rev123' },
    });
    const revToken = revOfficerAuth.data?.token;

    const crossDeptBlock = await request(`/applications/${application.applicationId}/documents`, {
      headers: { Authorization: `Bearer ${revToken}` },
    });
    assert('E2E-11: Cross-department Revenue officer cannot access application (403)', crossDeptBlock.status === 403);

    // 12. Citizen revokes consent
    const consentId = application.consentId;
    const revokeConsentRes = await request(`/consents/${consentId}/revoke`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { reason: 'Application audit completed' },
    });
    assert('E2E-12: Citizen revokes consent for application', revokeConsentRes.status === 200);

    // 13. Future data access blocked after consent revocation
    const blockedFetch = await request(`/applications/${application.applicationId}/documents/request`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { documentId: 'doc-income', purpose: 'Eligibility recheck' },
    });
    assert(
      'E2E-13: Data exchange request blocked post consent revocation (403)',
      blockedFetch.status === 403
    );

    // 14. Activity trail verification
    const activities = await request('/activities', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const hasConsentRevoke = activities.data?.some(
      (a) => a.type === 'consent_revoke' && a.applicationId === application.applicationId
    );
    assert('E2E-14: Comprehensive audit activity trail logged end-to-end', hasConsentRevoke);

  } catch (err) {
    console.error('E2E execution error:', err);
    failed++;
  }

  console.log('================================================================');
  console.log(`E2E RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
