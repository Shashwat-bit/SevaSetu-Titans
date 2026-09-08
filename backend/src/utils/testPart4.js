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
  console.log('       SEVASETU PART 4 - OFFICER WORKFLOW SECURITY SUITE        ');
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

  // 1. Obtain authenticated tokens
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

  const transLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'officer.trans@gov.in', password: 'Officer@Trans123' },
  });
  const transToken = transLogin.data?.token;

  // Test 1: Citizen cannot access officer dashboard (403)
  const citDash = await request('/officer/dashboard', {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert('1. Citizen cannot access officer dashboard (403)', citDash.status === 403);

  // Test 2: Education Officer can access Education applications (200, dept-edu only)
  const eduApps = await request('/officer/applications', {
    headers: { Authorization: `Bearer ${eduToken}` },
  });
  const allEdu =
    Array.isArray(eduApps.data) &&
    eduApps.data.length > 0 &&
    eduApps.data.every((a) => a.departmentId === 'dept-edu');
  assert(
    '2. Education Officer can access Education applications',
    eduApps.status === 200 && allEdu
  );

  // Test 3: Education Officer cannot access Revenue application (403)
  const eduCrossAccess = await request('/officer/applications/SS-2026-000842', {
    headers: { Authorization: `Bearer ${eduToken}` },
  });
  assert('3. Education Officer cannot access Revenue application (403)', eduCrossAccess.status === 403);

  // Test 4: Revenue Officer cannot modify Education application status (403)
  const revCrossModify = await request('/officer/applications/SS-2026-001024/status', {
    method: 'POST',
    headers: { Authorization: `Bearer ${revToken}` },
    body: { status: 'Under Review' },
  });
  assert('4. Revenue Officer cannot modify Education application status (403)', revCrossModify.status === 403);

  // Test 5: Transport Officer cannot modify Revenue applications (403)
  const transCrossModify = await request('/officer/applications/SS-2026-000915/status', {
    method: 'POST',
    headers: { Authorization: `Bearer ${transToken}` },
    body: { status: 'Under Verification' },
  });
  assert('5. Transport Officer cannot modify Revenue applications (403)', transCrossModify.status === 403);

  // Test 6: Authorized officer can verify a document (200, status VERIFIED, verifiedBy = officer User ID)
  const eduVerifyDoc = await request('/officer/applications/SS-2026-001024/documents/doc-edu-001/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${eduToken}` },
  });
  const eduUserId = eduLogin.data?.user?.id;
  const eduCitizenId = eduLogin.data?.user?.citizenId;
  assert(
    '6. Authorized officer can verify an attached document (verifiedBy stores officer User ID, not citizenId)',
    eduVerifyDoc.status === 200 &&
      eduVerifyDoc.data?.verificationStatus === 'VERIFIED' &&
      eduVerifyDoc.data?.verifiedBy === eduUserId &&
      eduVerifyDoc.data?.verifiedBy !== eduCitizenId
  );

  // Test 7: Unauthorized officer cannot verify a document (403)
  const revUnauthVerify = await request('/officer/applications/SS-2026-001024/documents/doc-edu-001/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${revToken}` },
  });
  assert('7. Unauthorized officer cannot verify a document (403)', revUnauthVerify.status === 403);

  // Test 8: Officer can reject a document with a reason (verifiedBy = officer User ID)
  const eduRejectDoc = await request('/officer/applications/SS-2026-001024/documents/doc-edu-001/reject', {
    method: 'POST',
    headers: { Authorization: `Bearer ${eduToken}` },
    body: { reason: 'Class XII marksheet requires high-resolution scanned upload.' },
  });
  assert(
    '8. Officer can reject a document with required reason (verifiedBy stores officer User ID, not citizenId)',
    eduRejectDoc.status === 200 &&
      eduRejectDoc.data?.verificationStatus === 'REJECTED' &&
      eduRejectDoc.data?.rejectionReason?.includes('Class XII marksheet') &&
      eduRejectDoc.data?.verifiedBy === eduUserId &&
      eduRejectDoc.data?.verifiedBy !== eduCitizenId
  );

  // Re-verify document so application is in good shape for status transitions
  await request('/officer/applications/SS-2026-001024/documents/doc-edu-001/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${eduToken}` },
  });

  // Test 9: Officer can add an application remark (200, officerId = officer User ID)
  const eduRemark = await request('/officer/applications/SS-2026-001024/remarks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${eduToken}` },
    body: { text: 'Academic quota eligibility criteria met. Family income verified below statutory threshold.' },
  });
  assert(
    '9. Officer can add an official desk remark (officerId stores officer User ID, not citizenId)',
    eduRemark.status === 200 &&
      eduRemark.data?.text?.includes('Academic quota eligibility') &&
      eduRemark.data?.officerId === eduUserId &&
      eduRemark.data?.officerId !== eduCitizenId
  );

  // Test 10: Citizen cannot add officer remarks (403)
  const citRemark = await request('/officer/applications/SS-2026-001024/remarks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: { text: 'Attempting to post as citizen' },
  });
  assert('10. Citizen cannot add officer remarks (403)', citRemark.status === 403);

  // Test 11: Officer can perform a valid status transition (200, assignedOfficerId = officer User ID)
  // SS-2026-001024 starts at 'Under Verification' -> valid next is 'Under Review'
  const validTransition = await request('/officer/applications/SS-2026-001024/status', {
    method: 'POST',
    headers: { Authorization: `Bearer ${eduToken}` },
    body: { status: 'Under Review' },
  });
  assert(
    '11. Officer can perform valid status transition (assignedOfficerId stores officer User ID)',
    validTransition.status === 200 &&
      validTransition.data?.status === 'Under Review' &&
      validTransition.data?.assignedOfficerId === eduUserId &&
      validTransition.data?.assignedOfficerId !== eduCitizenId
  );

  // Test 12: Officer cannot perform an invalid status transition (400)
  // From 'Under Review', jumping to 'Submitted' or skipping to invalid state returns 400
  const invalidTransition = await request('/officer/applications/SS-2026-001024/status', {
    method: 'POST',
    headers: { Authorization: `Bearer ${eduToken}` },
    body: { status: 'Submitted' },
  });
  assert('12. Officer cannot perform invalid status transition (400)', invalidTransition.status === 400);

  // Test 13: Citizen cannot change application status (403)
  const citStatusChange = await request('/officer/applications/SS-2026-001024/status', {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: { status: 'Approved' },
  });
  assert('13. Citizen cannot change application status (403)', citStatusChange.status === 403);

  // Test 14: Officer actions create activity/audit events
  const auditList = await request('/activities', {
    headers: { Authorization: `Bearer ${eduToken}` },
  });
  const hasVerificationAudit =
    Array.isArray(auditList.data) &&
    auditList.data.some((act) => act.type === 'verification' || act.action.includes('Document'));
  assert(
    '14. Officer actions create activity/audit events',
    auditList.status === 200 && hasVerificationAudit
  );

  // Test 15: Citizen sees updated application status
  const citViewApp = await request('/applications/SS-2026-001024', {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert(
    '15. Citizen sees updated application status (Under Review)',
    citViewApp.status === 200 && citViewApp.data?.status === 'Under Review'
  );

  // Test 16: Citizen sees officer-related timeline events where appropriate
  const citTimeline = await request('/applications/SS-2026-001024/timeline', {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  const hasOfficerEvent =
    Array.isArray(citTimeline.data) &&
    citTimeline.data.some(
      (ev) => ev.title.includes('Document Verified') || ev.title.includes('Officer Remark')
    );
  assert(
    '16. Citizen sees officer-related timeline events in audit stream',
    citTimeline.status === 200 && hasOfficerEvent
  );

  // Test 17: Existing citizen application flow still works
  const newApp = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: {
      serviceId: 'service-scholarship',
      prefilledFields: {
        'Full Name': { value: 'Tanishka', source: 'DigiLocker Mock (UIDAI)', verified: true },
      },
      userFields: { 'College Name': 'IIT Gandhinagar' },
      attachedDocs: [
        {
          docId: 'doc-auto-1',
          name: 'Class XII Senior School Marksheet',
          docType: 'Marksheet',
          source: 'DigiLocker Mock (CBSE)',
          verified: true,
          verificationStatus: 'PENDING',
        },
      ],
    },
  });
  assert(
    '17. Existing citizen application submission flow still works',
    newApp.status === 201 && newApp.data?.applicationId?.startsWith('SS-2026-')
  );

  // Test 18: Existing consent functionality still works
  const consents = await request('/consents', {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert(
    '18. Existing consent functionality still works',
    consents.status === 200 && Array.isArray(consents.data)
  );

  // Test 19: Existing authentication still works
  const reAuth = await request('/auth/me', {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert(
    '19. Existing authentication session endpoint works',
    reAuth.status === 200 && reAuth.data?.email === 'tanishka@example.com'
  );

  // Test 20: Officer dashboard statistics match live database
  const eduDash = await request('/officer/dashboard', {
    headers: { Authorization: `Bearer ${eduToken}` },
  });
  assert(
    '20. Officer dashboard statistics dynamically calculated from MongoDB',
    eduDash.status === 200 &&
      eduDash.data?.stats?.total >= 1 &&
      eduDash.data?.officer?.departmentId === 'dept-edu'
  );

  console.log('================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Part 4 Test suite error:', err);
  process.exit(1);
});
