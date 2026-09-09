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
  console.log('    SEVASETU PART 6 - CONSENT, AUDIT & SECURITY HARDENING SUITE ');
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
    // Deterministic test isolation: reset seed state
    await request('/seed', {
      method: 'POST',
      headers: { 'x-dev-seed-key': 'sevasetu-dev-seed-bypass' },
    });

    // 0. Authenticate personas
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

    assert('0. Authenticated test personas successfully', Boolean(citizenToken && eduToken && revToken));

    // TEST 1: Valid consent allows exchange (200)
    // SS-2026-001024 has active consent perm-edu-001
    const validExchange = await request('/applications/SS-2026-001024/documents/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { documentId: 'doc-aadhaar', purpose: 'Identity Verification' },
    });
    assert(
      '1. Valid active consent allows document exchange (200)',
      validExchange.status === 200 && validExchange.data?.exchange?.status === 'FETCHED'
    );

    // TEST 2: Revoked consent immediately blocks exchange (403)
    const revokeRes = await request('/consents/perm-edu-001/revoke', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { reason: 'User revoked consent for scholarship application' },
    });
    assert('2a. Consent revoked successfully', revokeRes.status === 200);

    const postRevokeAttempt = await request('/applications/SS-2026-001024/documents/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { documentId: 'doc-cbse-12', purpose: 'Academic Scrutiny' },
    });
    assert(
      '2b. Revoked consent immediately blocks future exchange (403)',
      postRevokeAttempt.status === 403
    );

    // TEST 3: Historical consent record preserved when revoked
    const histConsent = await request('/consents/perm-edu-001', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      '3. Historical consent records preserved in database upon revocation',
      histConsent.status === 200 &&
        (histConsent.data?.status === 'Access Revoked' || histConsent.data?.status === 'REVOKED') &&
        Boolean(histConsent.data?.revokedAt)
    );

    // TEST 4: Expired consent blocks exchange (403)
    // Create an expired consent record
    const expiredConsentRes = await request('/consents', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: {
        departmentId: 'dept-edu',
        whoHasAccess: 'Education Department, Govt. of India',
        whatData: ['Aadhaar Card (e-KYC)'],
        whyPurpose: 'Historical verification',
        whichApplicationId: 'SS-2026-001024',
        whichServiceName: 'Post-Matric & Merit Scholarship',
        fromWhen: '01 Jan 2020, 10:00 AM',
        untilWhen: '01 Feb 2020',
        expiresAt: '2020-02-01T00:00:00.000Z',
        status: 'Expired',
      },
    });

    const expiredExchange = await request('/applications/SS-2026-001024/documents/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { documentId: 'doc-aadhaar', purpose: 'Check expired consent behavior' },
    });
    assert(
      '4. Expired consent strictly blocks document exchange (403)',
      expiredExchange.status === 403
    );

    // TEST 5: Consent for another application does not authorize this application (403)
    // Submit a fresh application without creating consent for it yet
    const newAppRes = await request('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: {
        serviceId: 'service-income',
        prefilledFields: { 'Full Name': 'Tanishka' },
        userFields: { 'Annual Income': '120000' },
        attachedDocs: [
          {
            docId: 'doc-aadhaar',
            name: 'Aadhaar Identity Card (e-KYC)',
            docType: 'Identity Document',
            source: 'DigiLocker Mock Adapter (Demo)',
            verified: true,
          },
        ],
      },
    });
    const newApp = newAppRes.data;

    // Revoke the consent auto-created for newApp
    await request(`/consents/${newApp.consentId}/revoke`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });

    // Even though perm-rev-002 exists for dept-rev (for SS-2026-000915), it must NOT authorize newApp
    const wrongAppExchange = await request(`/applications/${newApp.applicationId}/documents/request`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { documentId: 'doc-aadhaar', purpose: 'Income Verification' },
    });
    assert(
      '5. Consent for another application does not authorize this application (403)',
      wrongAppExchange.status === 403
    );

    // TEST 6: Wrong citizen access blocked (IDOR/BOLA)
    // Officer trying to access /consents gets 403
    const officerConsentAccess = await request('/consents', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    const officerSingleConsent = await request('/consents/perm-rev-002', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    assert(
      '6. Unauthorized citizen/officer consent access blocked (403)',
      officerConsentAccess.status === 403 && officerSingleConsent.status === 403
    );

    // TEST 7: Consent denial blocks exchange and logs audit event
    const denyRes = await request('/consents/perm-rev-002/deny', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { reason: 'Citizen refused domicile data access' },
    });
    assert('7a. Consent denied successfully (200)', denyRes.status === 200 && denyRes.data?.status === 'Denied');

    const deniedExchange = await request('/applications/SS-2026-000915/documents/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { documentId: 'doc-aadhaar', purpose: 'Domicile verification' },
    });
    assert('7b. Denied consent blocks document exchange (403)', deniedExchange.status === 403);

    // TEST 8: Unauthorized audit modification blocked (Immutability)
    const putAudit = await request('/activities/act-001', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { action: 'Tampered' },
    });
    const deleteAudit = await request('/activities/act-001', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const putExchangeAudit = await request('/interop/exchanges/xchg-001', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { status: 'MODIFIED' },
    });
    const deleteExchangeAudit = await request('/interop/exchanges/xchg-001', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      '8. Historical audit records & exchange trails are strictly immutable (403)',
      putAudit.status === 403 &&
        deleteAudit.status === 403 &&
        putExchangeAudit.status === 403 &&
        deleteExchangeAudit.status === 403
    );

    // TEST 9: Unauthorized document and application access blocked
    // Officer cannot browse vault
    const offVault = await request('/interop/vault', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    // Citizen cannot advance status
    const citStatus = await request('/applications/SS-2026-001024', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: {},
    });
    // Revenue officer cannot view Education application documents
    const crossDeptDocs = await request('/applications/SS-2026-001024/documents', {
      headers: { Authorization: `Bearer ${revToken}` },
    });
    assert(
      '9. Unauthorized document and application access strictly blocked (403)',
      offVault.status === 403 && citStatus.status === 403 && crossDeptDocs.status === 403
    );

    // TEST 10: Data minimization enforced for officers
    // Education officer calling /documents only receives application-attached documents
    const offDocs = await request('/documents', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    const allEducationDocs =
      offDocs.status === 200 &&
      Array.isArray(offDocs.data) &&
      offDocs.data.every((d) => d.documentId === 'doc-aadhaar' || d.documentId === 'doc-cbse-12');
    assert(
      '10. Data minimization enforced: Officer only receives application-attached documents',
      allEducationDocs
    );

    // TEST 11: Audit events created for sensitive actions
    const activitiesRes = await request('/activities', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const activities = activitiesRes.data || [];

    const hasLoginAudit = activities.some((a) => a.type === 'login');
    const hasConsentGrantAudit = activities.some((a) => a.type === 'consent_grant');
    const hasConsentRevokeAudit = activities.some((a) => a.type === 'consent_revoke');
    const hasConsentDeniedAudit = activities.some((a) => a.type === 'consent_denied');
    const hasSubmissionAudit = activities.some((a) => a.type === 'submission');
    const hasExchangedAudit = activities.some((a) => a.type === 'document_exchanged');

    // Also trigger officer document access to verify document_access audit
    await request('/applications/SS-2026-001024/documents', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    const officerActivities = await request('/activities', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    const hasDocAccessAudit = (officerActivities.data || []).some(
      (a) => a.type === 'document_access'
    );

    assert(
      '11. Audit events created for sensitive actions (login, consent, document access, submission, exchange)',
      hasLoginAudit &&
        hasConsentGrantAudit &&
        hasConsentRevokeAudit &&
        hasConsentDeniedAudit &&
        hasSubmissionAudit &&
        hasExchangedAudit &&
        hasDocAccessAudit
    );

    // TEST 12: Security failures logged without leaking credentials
    const badLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'tanishka@example.com', password: 'IncorrectPasswordSecret' },
    });
    assert('12a. Invalid login rejected with 401', badLogin.status === 401);

    const secActivities = await request('/activities', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const hasSecurityAlert = (secActivities.data || []).some(
      (a) => a.type === 'security_alert' && !JSON.stringify(a).includes('IncorrectPasswordSecret')
    );
    assert('12b. Security failure logged to audit stream without leaking credentials', hasSecurityAlert);

  } catch (err) {
    console.error('Part 6 execution error:', err);
    failed++;
  }

  console.log('================================================================');
  console.log(`PART 6 RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
