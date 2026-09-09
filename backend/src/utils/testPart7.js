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
  console.log('   SEVASETU PART 7 - ANALYTICS, NOTIFICATIONS & ADMIN SUITE     ');
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
    // 0. Reset seed state for test isolation
    await request('/seed', {
      method: 'POST',
      headers: { 'x-dev-seed-key': 'sevasetu-dev-seed-bypass' },
    });

    // Authenticate personas
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

    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@sevasetu.gov.in', password: 'Admin@123' },
    });
    const adminToken = adminLogin.data?.token;

    assert(
      '0. Authenticated test personas successfully (Citizen, Officers, Admin)',
      Boolean(citizenToken && eduToken && revToken && adminToken)
    );

    // =========================================================================
    // 1. ADMIN ACCESS
    // =========================================================================
    const adminOverview = await request('/admin/overview', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      '1. Admin can access admin overview (/admin/overview) with 200 OK',
      adminOverview.status === 200 &&
        adminOverview.data?.stats?.totalApplications !== undefined &&
        adminOverview.data?.adapterHealth !== undefined
    );

    const adminAnalytics = await request('/admin/analytics', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      '2. Admin can access system analytics (/admin/analytics) with 200 OK',
      adminAnalytics.status === 200 &&
        adminAnalytics.data?.applications !== undefined &&
        adminAnalytics.data?.consents !== undefined &&
        adminAnalytics.data?.exchanges !== undefined &&
        adminAnalytics.data?.processing !== undefined
    );

    const adminDepts = await request('/admin/departments', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      '3. Admin can access department analytics (/admin/departments) with 200 OK',
      adminDepts.status === 200 &&
        Array.isArray(adminDepts.data) &&
        adminDepts.data.length > 0 &&
        adminDepts.data[0].departmentId !== undefined
    );

    const adminConsents = await request('/admin/consents', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminActs = await request('/admin/activities', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      '4. Admin can access system consents and audit logs with 200 OK',
      adminConsents.status === 200 &&
        Array.isArray(adminConsents.data) &&
        adminActs.status === 200 &&
        Array.isArray(adminActs.data)
    );

    // =========================================================================
    // 2. NON-ADMIN BLOCKED (403 FORBIDDEN & 401 UNAUTHORIZED)
    // =========================================================================
    const citOverview = await request('/admin/overview', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert('5. Citizen blocked from /admin/overview with 403 Forbidden', citOverview.status === 403);

    const citAnalytics = await request('/admin/analytics', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert('6. Citizen blocked from /admin/analytics with 403 Forbidden', citAnalytics.status === 403);

    const officerOverview = await request('/admin/overview', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    assert('7. Officer blocked from /admin/overview with 403 Forbidden', officerOverview.status === 403);

    const officerDepts = await request('/admin/departments', {
      headers: { Authorization: `Bearer ${revToken}` },
    });
    assert('8. Officer blocked from /admin/departments with 403 Forbidden', officerDepts.status === 403);

    const noAuthOverview = await request('/admin/overview');
    assert('9. Unauthenticated request to /admin/overview blocked with 401 Unauthorized', noAuthOverview.status === 401);

    // =========================================================================
    // 3. ANALYTICS USE REAL DB DATA
    // =========================================================================
    const appsStats = adminAnalytics.data?.applications;
    const totalAppsFromStats = appsStats?.totalApplications;
    const sumByStatus = (appsStats?.byStatus || []).reduce((acc, curr) => acc + curr.count, 0);

    assert(
      '10. Analytics use real DB data: Application status aggregation matches total applications',
      typeof totalAppsFromStats === 'number' &&
        totalAppsFromStats > 0 &&
        sumByStatus === totalAppsFromStats
    );

    const consentStats = adminAnalytics.data?.consents;
    const exchangeStats = adminAnalytics.data?.exchanges;
    assert(
      '11. Analytics use real DB data: Consent and data exchange metrics reflect real records',
      typeof consentStats?.total === 'number' &&
        consentStats.total > 0 &&
        typeof exchangeStats?.total === 'number' &&
        exchangeStats.total > 0
    );

    // =========================================================================
    // 4. NOTIFICATION RETRIEVAL & ISOLATION
    // =========================================================================
    const citNotifs = await request('/notifications', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      '12. Citizen can retrieve notifications with unread count',
      citNotifs.status === 200 &&
        Array.isArray(citNotifs.data) &&
        citNotifs.body?.unreadCount !== undefined
    );

    const eduNotifs = await request('/notifications', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    assert(
      '13. Officer can retrieve notifications with unread count',
      eduNotifs.status === 200 &&
        Array.isArray(eduNotifs.data) &&
        eduNotifs.body?.unreadCount !== undefined
    );

    // Isolation check: Citizen notifications should ONLY belong to citizen
    const allCitAreOwn = (citNotifs.data || []).every(
      (n) => n.recipientRole === 'citizen' && n.citizenId === 'cit-001'
    );
    assert('14. Citizen notification isolation: Citizen only sees their own notifications', allCitAreOwn);

    // Isolation check: Education officer should ONLY see dept-edu notifications
    const allEduAreOwnDept = (eduNotifs.data || []).every(
      (n) => n.recipientRole === 'officer' && n.departmentId === 'dept-edu'
    );
    assert(
      '15. Officer department isolation: Education officer only sees dept-edu notifications',
      allEduAreOwnDept
    );

    // =========================================================================
    // 5. EVENT-DRIVEN NOTIFICATION CREATION
    // =========================================================================
    // 16. Application Submitted creates notifications for citizen AND department
    const newAppRes = await request('/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: {
        serviceId: 'service-scholarship',
        prefilledFields: {
          fullName: { value: 'Tanishka', source: 'DigiLocker Mock Adapter (Demo)', verified: true },
        },
        userFields: {
          annualIncome: '180000',
        },
        attachedDocs: [
          {
            docId: 'doc-verify-test',
            name: 'Class 10/12 Marksheet',
            docType: 'Academic Record',
            source: 'DigiLocker Mock Adapter (Demo)',
            verified: false,
          },
          {
            docId: 'doc-reject-test',
            name: 'Address Information',
            docType: 'Address Proof',
            source: 'DigiLocker Mock Adapter (Demo)',
            verified: false,
          },
        ],
      },
    });
    const createdAppId = newAppRes.data?.applicationId;

    const citNotifsAfterSubmit = await request('/notifications', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const hasSubmitNotifCit = (citNotifsAfterSubmit.data || []).some(
      (n) => n.applicationId === createdAppId && n.type === 'application_submitted'
    );

    const eduNotifsAfterSubmit = await request('/notifications', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    const hasSubmitNotifOfficer = (eduNotifsAfterSubmit.data || []).some(
      (n) => n.applicationId === createdAppId && n.type === 'application_submitted'
    );

    assert(
      '16. Notification creation: Application submission notifies citizen and department officers',
      Boolean(createdAppId && hasSubmitNotifCit && hasSubmitNotifOfficer)
    );

    // 17. Document verification notifies citizen
    const verifyDocRes = await request(`/officer/applications/${createdAppId}/documents/0/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    const citNotifsAfterVerify = await request('/notifications', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const hasDocVerifiedNotif = (citNotifsAfterVerify.data || []).some(
      (n) => n.applicationId === createdAppId && n.type === 'document_verified'
    );
    assert(
      '17. Notification creation: Document verification creates citizen notification',
      verifyDocRes.status === 200 && hasDocVerifiedNotif
    );

    // 18. Document rejection notifies citizen
    const rejectDocRes = await request(`/officer/applications/${createdAppId}/documents/1/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${eduToken}` },
      body: { reason: 'Digital signature mismatch' },
    });
    const citNotifsAfterDocReject = await request('/notifications', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const hasDocRejectedNotif = (citNotifsAfterDocReject.data || []).some(
      (n) => n.applicationId === createdAppId && n.type === 'document_rejected'
    );
    assert(
      '18. Notification creation: Document rejection creates citizen notification',
      rejectDocRes.status === 200 && hasDocRejectedNotif
    );

    // 19. Status update notifies citizen
    const updateStatusRes = await request(`/officer/applications/${createdAppId}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${eduToken}` },
      body: { status: 'Under Verification' },
    });
    const citNotifsAfterStatus = await request('/notifications', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const hasStatusNotif = (citNotifsAfterStatus.data || []).some(
      (n) => n.applicationId === createdAppId && n.type === 'status_change'
    );
    assert(
      '19. Notification creation: Officer status advancement creates citizen notification',
      updateStatusRes.status === 200 && hasStatusNotif
    );

    // 20. Consent revocation notifies citizen and department officer
    // Citizen revokes consent for perm-edu-001
    const revokeRes = await request('/consents/perm-edu-001/revoke', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const citNotifsAfterRevoke = await request('/notifications', {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const hasRevokeCit = (citNotifsAfterRevoke.data || []).some((n) => n.type === 'consent_revoked');

    const eduNotifsAfterRevoke = await request('/notifications', {
      headers: { Authorization: `Bearer ${eduToken}` },
    });
    const hasRevokeOfficer = (eduNotifsAfterRevoke.data || []).some((n) => n.type === 'consent_revoked');

    assert(
      '20. Notification creation: Consent revocation notifies citizen and department officer',
      revokeRes.status === 200 && hasRevokeCit && hasRevokeOfficer
    );

    // =========================================================================
    // 6. IDOR / BOLA PROTECTION ON NOTIFICATIONS
    // =========================================================================
    // Citizen attempting to mark an officer's notification as read -> 403
    const officerNotifId = eduNotifs.data?.[0]?.notificationId || 'notif-demo-004';
    const badCitMark = await request(`/notifications/${officerNotifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      '21. IDOR/BOLA protection: Citizen cannot mark officer notification as read (403 Forbidden)',
      badCitMark.status === 403
    );

    // Revenue Officer attempting to mark Education officer notification as read -> 403
    const badOfficerMark = await request(`/notifications/${officerNotifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${revToken}` },
    });
    assert(
      '22. IDOR/BOLA protection: Officer cannot mark other department notification as read (403 Forbidden)',
      badOfficerMark.status === 403
    );

    // Authorized citizen markAsRead succeeds
    const citizenOwnNotifId = citNotifs.data?.[0]?.notificationId;
    const goodCitMark = await request(`/notifications/${citizenOwnNotifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      '23. Authorized markAsRead succeeds for citizen own notification (200 OK, isRead: true)',
      goodCitMark.status === 200 && goodCitMark.data?.isRead === true
    );

    // Authorized markAllAsRead succeeds
    const readAllRes = await request('/notifications/read-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(
      '24. Authorized markAllAsRead succeeds and updates unread count',
      readAllRes.status === 200 && typeof readAllRes.body?.updatedCount === 'number'
    );
  } catch (err) {
    console.error('Part 7 test execution error:', err);
    failed++;
  }

  console.log('================================================================');
  console.log(`PART 7 RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
