#!/usr/bin/env pwsh

param(
    [switch]$GenerateHtml,
    [switch]$OpenReport
)

Write-Host "🧪 Running tests with code coverage..." -ForegroundColor Blue

# Clean previous test results if requested
if (Test-Path "InternshipManagementSystem.Tests/TestResults") {
    Write-Host "🧹 Cleaning previous test results..." -ForegroundColor Gray
    Remove-Item "InternshipManagementSystem.Tests/TestResults" -Recurse -Force
}

# Run tests with coverage
Write-Host "▶️  Executing tests..." -ForegroundColor Yellow
$testResult = dotnet test InternshipManagementSystem.Tests --collect:"XPlat Code Coverage" --logger "console;verbosity=minimal"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Get the latest test results folder
$latestFolder = Get-ChildItem "InternshipManagementSystem.Tests/TestResults" -Directory | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 1

if (-not $latestFolder) {
    Write-Host "❌ No test results found!" -ForegroundColor Red
    exit 1
}

$coverageFile = Join-Path $latestFolder.FullName "coverage.cobertura.xml"

if (-not (Test-Path $coverageFile)) {
    Write-Host "❌ Coverage file not found!" -ForegroundColor Red
    exit 1
}

# Parse and display coverage
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

    # Generate HTML report if requested
    if ($GenerateHtml) {
        Write-Host ""
        Write-Host "📊 Generating HTML coverage report..." -ForegroundColor Blue
        
        if (Test-Path "coverage-report") {
            Remove-Item "coverage-report" -Recurse -Force
        }
        
        $reportResult = reportgenerator -reports:"InternshipManagementSystem.Tests/TestResults/*/coverage.cobertura.xml" -targetdir:"coverage-report" -reporttypes:Html
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ HTML report generated in 'coverage-report' folder" -ForegroundColor Green
            
            if ($OpenReport) {
                $indexPath = Join-Path (Get-Location) "coverage-report/index.html"
                Write-Host "🌐 Opening coverage report..." -ForegroundColor Blue
                Start-Process $indexPath
            } else {
                Write-Host "💡 Run with -OpenReport to automatically open the HTML report" -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ Failed to generate HTML report" -ForegroundColor Red
        }
    } else {
        Write-Host "💡 Run with -GenerateHtml to create a detailed HTML coverage report" -ForegroundColor Gray
    }

} catch {
    Write-Host "❌ Error parsing coverage file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Test run completed successfully!" -ForegroundColor Green 