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

async function runE2E() {
  console.log('================================================================');
  console.log('    SEVASETU PART 4 — END-TO-END WORKFLOW VERIFICATION          ');
  console.log('================================================================');

  // STEP 1: Citizen Login & Application Submission
  console.log('\n[STEP 1] Citizen (Tanishka) logging in...');
  const citLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'tanishka@example.com', password: 'Citizen@123' },
  });
  if (citLogin.status !== 200 || !citLogin.data?.token) {
    throw new Error('Citizen login failed');
  }
  const citizenToken = citLogin.data.token;
  console.log('Citizen logged in successfully. Token acquired.');

  console.log('Submitting application for Post-Matric & Merit Scholarship...');
  const submitRes = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: {
      serviceId: 'service-scholarship',
      prefilledFields: {
        'Full Name': { value: 'Tanishka', source: 'DigiLocker Mock (UIDAI)', verified: true },
        'Date of Birth': { value: '14/05/2002', source: 'DigiLocker Mock (UIDAI)', verified: true },
      },
      userFields: {
        'College Name': 'Gujarat Technological University',
        'Course & Year': 'B.Tech IT, 4th Year',
      },
      attachedDocs: [
        {
          docId: 'doc-sch-01',
          name: 'Class XII Senior School Marksheet',
          docType: 'Marksheet',
          source: 'DigiLocker Mock (CBSE)',
          verified: false,
          verificationStatus: 'PENDING',
        },
        {
          docId: 'doc-sch-02',
          name: 'Income Self-Declaration',
          docType: 'Income Certificate',
          source: 'DigiLocker Mock',
          verified: false,
          verificationStatus: 'PENDING',
        },
      ],
    },
  });

  if (submitRes.status !== 201 || !submitRes.data?.applicationId) {
    throw new Error('Application submission failed: ' + JSON.stringify(submitRes.body));
  }
  const createdAppId = submitRes.data.applicationId;
  console.log(`[PASS] Application created successfully with ID: ${createdAppId} (Status: ${submitRes.data.status})`);

  // STEP 2: Education Officer Login & Review
  console.log('\n[STEP 2] Education Officer (Dr. Arvind Sharma) logging in...');
  const eduLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'officer.edu@gov.in', password: 'Officer@Edu123' },
  });
  if (eduLogin.status !== 200 || !eduLogin.data?.token) {
    throw new Error('Education officer login failed');
  }
  const eduToken = eduLogin.data.token;
  console.log('Education Officer logged in. Department: ' + eduLogin.data.user?.departmentId);

  console.log(`Opening submitted application ${createdAppId} in Officer Review...`);
  const appDetailRes = await request(`/officer/applications/${createdAppId}`, {
    headers: { Authorization: `Bearer ${eduToken}` },
  });
  if (appDetailRes.status !== 200) {
    throw new Error(`Failed to load application detail: ${appDetailRes.status}`);
  }
  console.log(`[PASS] Application ${createdAppId} loaded with ${appDetailRes.data.documentsAttached.length} documents.`);

  console.log('Verifying Class XII Marksheet...');
  const verifyDocRes = await request(`/officer/applications/${createdAppId}/documents/doc-sch-01/verify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${eduToken}` },
  });
  if (
    verifyDocRes.status !== 200 ||
    verifyDocRes.data?.verificationStatus !== 'VERIFIED' ||
    verifyDocRes.data?.verifiedBy !== eduLogin.data?.user?.id ||
    verifyDocRes.data?.verifiedBy === eduLogin.data?.user?.citizenId
  ) {
    throw new Error('Document verification failed or verifiedBy did not store officer user ID');
  }
  console.log('[PASS] Document marked as VERIFIED by Education Officer (verifiedBy = officer User ID).');

  console.log('Adding official desk remark...');
  const remarkRes = await request(`/officer/applications/${createdAppId}/remarks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${eduToken}` },
    body: { text: 'Academic credentials verified. Candidate meets minimum 60% criteria.' },
  });
  if (
    remarkRes.status !== 200 ||
    remarkRes.data?.officerId !== eduLogin.data?.user?.id ||
    remarkRes.data?.officerId === eduLogin.data?.user?.citizenId
  ) {
    throw new Error('Add remark failed or officerId did not store officer user ID');
  }
  console.log('[PASS] Officer desk remark recorded in MongoDB (officerId = officer User ID).');

  console.log('Transitioning status: Submitted -> Under Verification...');
  const advanceToVerif = await request(`/officer/applications/${createdAppId}/status`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${eduToken}` },
    body: { status: 'Under Verification' },
  });
  if (advanceToVerif.status !== 200 || advanceToVerif.data?.status !== 'Under Verification') {
    throw new Error('Transition to Under Verification failed');
  }
  console.log('[PASS] Status advanced to: Under Verification');

  console.log('Transitioning status: Under Verification -> Under Review...');
  const advanceToReview = await request(`/officer/applications/${createdAppId}/status`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${eduToken}` },
    body: { status: 'Under Review' },
  });
  if (advanceToReview.status !== 200 || advanceToReview.data?.status !== 'Under Review') {
    throw new Error('Transition to Under Review failed');
  }
  console.log('[PASS] Status advanced to: Under Review');

  // STEP 3: Citizen view synchronization
  console.log('\n[STEP 3] Citizen logging back in to verify live application state...');
  const citCheckApp = await request(`/applications/${createdAppId}`, {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  if (citCheckApp.status !== 200) {
    throw new Error('Citizen could not fetch application');
  }
  const syncedApp = citCheckApp.data;
  if (syncedApp.status !== 'Under Review') {
    throw new Error(`Expected status 'Under Review', got '${syncedApp.status}'`);
  }
  if (!syncedApp.officerRemarks || syncedApp.officerRemarks.length === 0) {
    throw new Error('Officer remarks not visible on citizen application');
  }
  const verifiedDoc = syncedApp.documentsAttached.find((d) => d.docId === 'doc-sch-01');
  if (verifiedDoc?.verificationStatus !== 'VERIFIED') {
    throw new Error('Verified document status not visible on citizen application');
  }
  console.log(`[PASS] Citizen sees updated status: ${syncedApp.status}`);
  console.log(`[PASS] Citizen sees officer remark: "${syncedApp.officerRemarks[0].text}"`);
  console.log(`[PASS] Citizen sees verified document: "${verifiedDoc.name}" (${verifiedDoc.verificationStatus})`);

  // STEP 4: Security Test — Revenue Officer Cross-Department Access Attempt
  console.log('\n[STEP 4] Revenue Officer attempting cross-department access to Education application...');
  const revLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'officer.rev@gov.in', password: 'Officer@Rev123' },
  });
  const revToken = revLogin.data.token;

  const revAttemptView = await request(`/officer/applications/${createdAppId}`, {
    headers: { Authorization: `Bearer ${revToken}` },
  });
  if (revAttemptView.status !== 403) {
    throw new Error(`Expected 403 Forbidden for Revenue Officer view, got ${revAttemptView.status}`);
  }
  console.log('[PASS] Revenue Officer view rejected with 403 Forbidden.');

  const revAttemptModify = await request(`/officer/applications/${createdAppId}/status`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${revToken}` },
    body: { status: 'Approved' },
  });
  if (revAttemptModify.status !== 403) {
    throw new Error(`Expected 403 Forbidden for Revenue Officer modification, got ${revAttemptModify.status}`);
  }
  console.log('[PASS] Revenue Officer modification rejected with 403 Forbidden.');

  console.log('\n================================================================');
  console.log('   ALL END-TO-END SCENARIO STEPS PASSED SUCCESSFULLY!          ');
  console.log('================================================================\n');
}

runE2E().catch((err) => {
  console.error('[FAIL] End-to-end test error:', err);
  process.exit(1);
});
