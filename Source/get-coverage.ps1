#!/usr/bin/env pwsh

# Get the latest test results folder
$latestFolder = Get-ChildItem "InternshipManagementSystem.Tests/TestResults" -Directory | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 1

if (-not $latestFolder) {
    Write-Host "No test results found. Run 'dotnet test --collect:\"XPlat Code Coverage\"' first." -ForegroundColor Red
    exit 1
}

$coverageFile = Join-Path $latestFolder.FullName "coverage.cobertura.xml"

if (-not (Test-Path $coverageFile)) {
    Write-Host "Coverage file not found in $($latestFolder.Name)" -ForegroundColor Red
    exit 1
}

# Parse the XML
try {
    $xml = [xml](Get-Content $coverageFile)
    $lineRate = [double]$xml.coverage.'line-rate'
    $branchRate = [double]$xml.coverage.'branch-rate'
    $linesCovered = $xml.coverage.'lines-covered'
    $linesValid = $xml.coverage.'lines-valid'
    $branchesCovered = $xml.coverage.'branches-covered'
    $branchesValid = $xml.coverage.'branches-valid'
    $timestamp = [DateTimeOffset]::FromUnixTimeSeconds($xml.coverage.timestamp).ToString("yyyy-MM-dd HH:mm:ss")

    Write-Host ""
    Write-Host "=== CODE COVERAGE REPORT ===" -ForegroundColor Green
    Write-Host "Test Run: $($latestFolder.Name)" -ForegroundColor Gray
    Write-Host "Generated: $timestamp" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Line Coverage:   $([math]::Round($lineRate * 100, 2))% ($linesCovered/$linesValid lines)" -ForegroundColor Yellow
    Write-Host "Branch Coverage: $([math]::Round($branchRate * 100, 2))% ($branchesCovered/$branchesValid branches)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Overall Coverage: $([math]::Round($lineRate * 100, 2))%" -ForegroundColor Cyan
    Write-Host ""

    # Coverage quality assessment
    $overallCoverage = $lineRate * 100
    if ($overallCoverage -ge 80) {
        Write-Host "✅ Excellent coverage!" -ForegroundColor Green
    } elseif ($overallCoverage -ge 60) {
        Write-Host "✅ Good coverage" -ForegroundColor Yellow
    } elseif ($overallCoverage -ge 40) {
        Write-Host "⚠️  Moderate coverage - consider adding more tests" -ForegroundColor Orange
    } else {
        Write-Host "❌ Low coverage - more tests needed" -ForegroundColor Red
    }

} catch {
    Write-Host "Error parsing coverage file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 