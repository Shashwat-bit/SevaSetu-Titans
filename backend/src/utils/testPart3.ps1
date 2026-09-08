# SevaSetu Part 3 Comprehensive Test Suite
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "        SEVASETU PART 3 - SECURITY & AUTH VERIFICATION          " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"
$passed = 0
$failed = 0

function Assert-Test($name, $condition, $details) {
    if ($condition) {
        Write-Host "[PASS] $name" -ForegroundColor Green
        $global:passed++
    } else {
        Write-Host "[FAIL] $name - $details" -ForegroundColor Red
        $global:failed++
    }
}

# 1. Citizen Login
try {
    $citizenLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"tanishka@example.com","password":"Citizen@123"}'
    $citizenToken = $citizenLogin.token
    Assert-Test "1. Login succeeds with demo citizen" ($citizenToken -ne $null -and $citizenLogin.user.role -eq "citizen") "Expected token and role=citizen"
} catch {
    Assert-Test "1. Login succeeds with demo citizen" $false $_.Exception.Message
}

# 2. Officer Login
try {
    $officerLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"officer.edu@gov.in","password":"Officer@Edu123"}'
    $officerToken = $officerLogin.token
    Assert-Test "2. Login succeeds with demo officer" ($officerToken -ne $null -and $officerLogin.user.role -eq "officer" -and $officerLogin.user.departmentId -eq "dept-edu") "Expected token and role=officer, dept-edu"
} catch {
    Assert-Test "2. Login succeeds with demo officer" $false $_.Exception.Message
}

# 3. Invalid password fails with 401
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"tanishka@example.com","password":"WrongPassword!"}'
    Assert-Test "3. Invalid password fails with 401" $false "Expected 401 but request succeeded"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "3. Invalid password fails with 401" ($statusCode -eq 401) "Got status: $statusCode"
}

# 4. Missing token receives 401
try {
    Invoke-RestMethod -Uri "$baseUrl/applications" -Method Get
    Assert-Test "4. Missing token receives 401" $false "Expected 401 but request succeeded"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "4. Missing token receives 401" ($statusCode -eq 401) "Got status: $statusCode"
}

# 5. Citizen can access own applications
try {
    $citApps = Invoke-RestMethod -Uri "$baseUrl/applications" -Method Get -Headers @{ Authorization = "Bearer $citizenToken" }
    Assert-Test "5. Citizen can access own applications" ($citApps.Length -ge 1) "Returned $($citApps.Length) apps"
} catch {
    Assert-Test "5. Citizen can access own applications" $false $_.Exception.Message
}

# 6. Citizen cannot access another citizen's application
try {
    # Even if passing an arbitrary ID or trying to filter
    $filteredApps = Invoke-RestMethod -Uri "$baseUrl/applications?citizenId=cit-999" -Method Get -Headers @{ Authorization = "Bearer $citizenToken" }
    # Backend overrides ?citizenId with req.user.citizenId ('cit-001')
    $allAreMine = $filteredApps | ForEach-Object { $_.citizenId -eq "cit-001" }
    Assert-Test "6. Citizen cannot query other citizen data via query spoofing" (-not ($allAreMine -contains $false)) "Ownership preserved"
} catch {
    Assert-Test "6. Citizen cannot query other citizen data" $false $_.Exception.Message
}

# 7. Citizen cannot advance application status (403)
try {
    Invoke-RestMethod -Uri "$baseUrl/applications/SS-2026-001024" -Method Put -ContentType "application/json" -Headers @{ Authorization = "Bearer $citizenToken" } -Body '{}'
    Assert-Test "7. Citizen cannot advance application status" $false "Expected 403 but got 200"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "7. Citizen cannot advance application status (403)" ($statusCode -eq 403) "Got status: $statusCode"
}

# 8. Officer can access applications in their department
try {
    $eduApps = Invoke-RestMethod -Uri "$baseUrl/applications" -Method Get -Headers @{ Authorization = "Bearer $officerToken" }
    $onlyEdu = $eduApps | ForEach-Object { $_.departmentId -eq "dept-edu" }
    Assert-Test "8. Officer can access applications in their department" ($eduApps.Length -ge 1 -and (-not ($onlyEdu -contains $false))) "Returned $($eduApps.Length) dept-edu apps"
} catch {
    Assert-Test "8. Officer can access applications in their department" $false $_.Exception.Message
}

# 9. Education officer cannot modify Revenue department applications (403)
try {
    Invoke-RestMethod -Uri "$baseUrl/applications/SS-2026-000842" -Method Put -ContentType "application/json" -Headers @{ Authorization = "Bearer $officerToken" } -Body '{}'
    Assert-Test "9. Education officer cannot modify Revenue department apps (403)" $false "Expected 403 but succeeded"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "9. Education officer cannot modify Revenue department apps (403)" ($statusCode -eq 403) "Got status: $statusCode"
}

# 10. Officer can advance a matching department application (200)
try {
    $advApp = Invoke-RestMethod -Uri "$baseUrl/applications/SS-2026-001024" -Method Put -ContentType "application/json" -Headers @{ Authorization = "Bearer $officerToken" } -Body '{}'
    Assert-Test "10. Officer can advance a matching department application" ($advApp.status -ne $null) "Updated status: $($advApp.status)"
} catch {
    Assert-Test "10. Officer can advance a matching department application" $false $_.Exception.Message
}

# 11. Citizen can view own consent
try {
    $consents = Invoke-RestMethod -Uri "$baseUrl/consents" -Method Get -Headers @{ Authorization = "Bearer $citizenToken" }
    Assert-Test "11. Citizen can view own consent" ($consents.Length -ge 1) "Returned $($consents.Length) consents"
} catch {
    Assert-Test "11. Citizen can view own consent" $false $_.Exception.Message
}

# 12. Officer cannot revoke citizen consent (403)
try {
    Invoke-RestMethod -Uri "$baseUrl/consents/perm-edu-001/revoke" -Method Post -Headers @{ Authorization = "Bearer $officerToken" }
    Assert-Test "12. Officer cannot revoke citizen consent (403)" $false "Expected 403 but succeeded"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "12. Officer cannot revoke citizen consent (403)" ($statusCode -eq 403) "Got status: $statusCode"
}

# 13. Citizen can revoke own consent
try {
    $revoked = Invoke-RestMethod -Uri "$baseUrl/consents/perm-edu-001/revoke" -Method Post -Headers @{ Authorization = "Bearer $citizenToken" }
    Assert-Test "13. Citizen can revoke own consent" ($revoked.status -eq "Revoked") "Consent status: $($revoked.status)"
} catch {
    Assert-Test "13. Citizen can revoke own consent" $false $_.Exception.Message
}

# 14. Citizen can access own documents
try {
    $docs = Invoke-RestMethod -Uri "$baseUrl/documents" -Method Get -Headers @{ Authorization = "Bearer $citizenToken" }
    Assert-Test "14. Citizen can access own documents" ($docs.Length -ge 1) "Returned $($docs.Length) documents"
} catch {
    Assert-Test "14. Citizen can access own documents" $false $_.Exception.Message
}

# 15. Anonymous user cannot access protected personal data (401)
try {
    Invoke-RestMethod -Uri "$baseUrl/activities" -Method Get
    Assert-Test "15. Anonymous user cannot access activities (401)" $false "Expected 401"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "15. Anonymous user cannot access activities (401)" ($statusCode -eq 401) "Got status: $statusCode"
}

# 16. /api/seed is protected against non-admin (403)
try {
    Invoke-RestMethod -Uri "$baseUrl/seed" -Method Post -Headers @{ Authorization = "Bearer $citizenToken" }
    Assert-Test "16. /api/seed is protected against non-admin (403)" $false "Expected 403"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test "16. /api/seed is protected against non-admin (403)" ($statusCode -eq 403) "Got status: $statusCode"
}

# 17. Demo persona switching returns a real JWT
try {
    $demoSwitch = Invoke-RestMethod -Uri "$baseUrl/auth/demo-switch" -Method Post -ContentType "application/json" -Body '{"persona":"officer-trans"}'
    Assert-Test "17. Demo persona switching returns a real JWT" ($demoSwitch.token -ne $null -and $demoSwitch.user.departmentId -eq "dept-trans") "Switched to transport officer"
} catch {
    Assert-Test "17. Demo persona switching returns a real JWT" $false $_.Exception.Message
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS: $passed PASSED, $failed FAILED" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "================================================================" -ForegroundColor Cyan
