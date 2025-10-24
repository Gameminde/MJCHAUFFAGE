#!/usr/bin/env node

/**
 * Integration Test Runner
 * Runs comprehensive integration tests for the MJ CHAUFFAGE e-commerce platform
 */

import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  duration: number;
  errors: string[];
}

class IntegrationTestRunner {
  private results: TestResult[] = [];
  private backendProcess: ChildProcess | null = null;
  private frontendProcess: ChildProcess | null = null;

  async run() {
    console.log('🚀 Starting Integration Test Suite');
    console.log('=====================================');

    try {
      // 1. Setup test environment
      await this.setupTestEnvironment();

      // 2. Start backend and frontend servers
      await this.startServers();

      // 3. Wait for servers to be ready
      await this.waitForServers();

      // 4. Run API integration tests
      await this.runApiTests();

      // 5. Run E2E tests
      await this.runE2ETests();

      // 6. Generate test report
      await this.generateReport();

    } catch (error) {
      console.error('❌ Integration tests failed:', error);
      process.exit(1);
    } finally {
      // 7. Cleanup
      await this.cleanup();
    }
  }

  private async setupTestEnvironment() {
    console.log('📋 Setting up test environment...');

    // Create test database
    await this.runCommand('npm', ['run', 'db:test:setup'], '../backend');

    // Seed test data
    await this.runCommand('npm', ['run', 'db:seed:test'], '../backend');

    // Clear any existing test artifacts
    await this.clearTestArtifacts();

    console.log('✅ Test environment ready');
  }

  private async startServers() {
    console.log('🔧 Starting backend and frontend servers...');

    // Start backend in test mode
    this.backendProcess = spawn('npm', ['run', 'dev:test'], {
      cwd: path.join(__dirname, '../../backend'),
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: 'pipe'
    });

    // Start frontend in test mode
    this.frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: 'pipe'
    });

    // Log server outputs
    this.backendProcess.stdout?.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`);
    });

    this.frontendProcess.stdout?.on('data', (data) => {
      console.log(`[Frontend] ${data.toString().trim()}`);
    });

    console.log('✅ Servers starting...');
  }

  private async waitForServers() {
    console.log('⏳ Waiting for servers to be ready...');

    // Wait for backend
    await this.waitForUrl('http://localhost:5000/api/health', 60000);
    console.log('✅ Backend server ready');

    // Wait for frontend
    await this.waitForUrl('http://localhost:3000', 60000);
    console.log('✅ Frontend server ready');
  }

  private async runApiTests() {
    console.log('🧪 Running API integration tests...');

    const startTime = Date.now();
    
    try {
      const result = await this.runCommand('npm', ['run', 'test:integration', '--', '--run']);
      
      this.results.push({
        suite: 'API Integration Tests',
        passed: this.extractPassedCount(result.stdout),
        failed: this.extractFailedCount(result.stdout),
        duration: Date.now() - startTime,
        errors: this.extractErrors(result.stdout)
      });

      console.log('✅ API integration tests completed');
    } catch (error) {
      console.error('❌ API integration tests failed:', error);
      
      this.results.push({
        suite: 'API Integration Tests',
        passed: 0,
        failed: 1,
        duration: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)]
      });
    }
  }

  private async runE2ETests() {
    console.log('🎭 Running E2E tests...');

    const testSuites = [
      'user-journey.spec.ts',
      'admin-website-communication.spec.ts',
      'payment-processing.spec.ts',
      'analytics-tracking.spec.ts'
    ];

    for (const suite of testSuites) {
      await this.runE2ETestSuite(suite);
    }
  }

  private async runE2ETestSuite(suiteName: string) {
    console.log(`🔍 Running E2E test suite: ${suiteName}`);

    const startTime = Date.now();
    
    try {
      const result = await this.runCommand('npx', ['playwright', 'test', `tests/e2e/${suiteName}`, '--reporter=json']);
      
      const jsonReport = JSON.parse(result.stdout);
      
      this.results.push({
        suite: `E2E - ${suiteName}`,
        passed: jsonReport.stats.passed || 0,
        failed: jsonReport.stats.failed || 0,
        duration: Date.now() - startTime,
        errors: this.extractPlaywrightErrors(jsonReport)
      });

      console.log(`✅ E2E test suite ${suiteName} completed`);
    } catch (error) {
      console.error(`❌ E2E test suite ${suiteName} failed:`, error);
      
      this.results.push({
        suite: `E2E - ${suiteName}`,
        passed: 0,
        failed: 1,
        duration: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)]
      });
    }
  }

  private async generateReport() {
    console.log('📊 Generating test report...');

    const totalPassed = this.results.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = this.results.reduce((sum, result) => sum + result.failed, 0);
    const totalDuration = this.results.reduce((sum, result) => sum + result.duration, 0);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: totalPassed + totalFailed,
        passed: totalPassed,
        failed: totalFailed,
        successRate: totalPassed / (totalPassed + totalFailed) * 100,
        totalDuration: totalDuration
      },
      suites: this.results
    };

    // Save JSON report
    await fs.writeFile(
      path.join(__dirname, '../test-results/integration-test-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate HTML report
    await this.generateHtmlReport(report);

    // Print summary to console
    this.printSummary(report);

    console.log('✅ Test report generated');
  }

  private async generateHtmlReport(report: any) {
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Integration Test Report - MJ CHAUFFAGE</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9em; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .suites { padding: 0 30px 30px; }
        .suite { margin-bottom: 20px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
        .suite-header { background: #f8f9fa; padding: 15px; font-weight: bold; }
        .suite-content { padding: 15px; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-top: 10px; font-family: monospace; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Integration Test Report</h1>
            <p>MJ CHAUFFAGE E-commerce Platform</p>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">${report.summary.totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value passed">${report.summary.passed}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value failed">${report.summary.failed}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.successRate.toFixed(1)}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${(report.summary.totalDuration / 1000).toFixed(1)}s</div>
                <div class="metric-label">Total Duration</div>
            </div>
        </div>
        
        <div class="suites">
            <h2>Test Suites</h2>
            ${report.suites.map((suite: TestResult) => `
                <div class="suite">
                    <div class="suite-header">
                        ${suite.suite}
                    </div>
                    <div class="suite-content">
                        <p><strong>Passed:</strong> <span class="passed">${suite.passed}</span> | <strong>Failed:</strong> <span class="failed">${suite.failed}</span> | <strong>Duration:</strong> ${(suite.duration / 1000).toFixed(1)}s</p>
                        ${suite.errors.length > 0 ? `
                            <h4>Errors:</h4>
                            ${suite.errors.map(error => `<div class="error">${error}</div>`).join('')}
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    await fs.writeFile(
      path.join(__dirname, '../test-results/integration-test-report.html'),
      htmlTemplate
    );
  }

  private printSummary(report: any) {
    console.log('\n📊 Integration Test Summary');
    console.log('===========================');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${report.summary.successRate.toFixed(1)}%`);
    console.log(`Total Duration: ${(report.summary.totalDuration / 1000).toFixed(1)}s`);
    
    if (report.summary.failed > 0) {
      console.log('\n❌ Failed Test Suites:');
      report.suites.forEach((suite: TestResult) => {
        if (suite.failed > 0) {
          console.log(`  - ${suite.suite}: ${suite.failed} failed`);
        }
      });
    }

    console.log('\n' + (report.summary.failed === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed'));
  }

  private async cleanup() {
    console.log('🧹 Cleaning up...');

    // Stop servers
    if (this.backendProcess) {
      this.backendProcess.kill();
    }
    if (this.frontendProcess) {
      this.frontendProcess.kill();
    }

    // Clean up test database
    try {
      await this.runCommand('npm', ['run', 'db:test:cleanup'], '../backend');
    } catch (error) {
      console.warn('Warning: Could not clean up test database:', error);
    }

    console.log('✅ Cleanup completed');
  }

  private async clearTestArtifacts() {
    const artifactDirs = [
      path.join(__dirname, '../test-results'),
      path.join(__dirname, '../screenshots'),
      path.join(__dirname, '../videos')
    ];

    for (const dir of artifactDirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        const files = await fs.readdir(dir);
        for (const file of files) {
          await fs.unlink(path.join(dir, file));
        }
      } catch (error) {
        // Directory might not exist, that's ok
      }
    }
  }

  private async waitForUrl(url: string, timeout: number = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Server at ${url} did not become ready within ${timeout}ms`);
  }

  private async runCommand(command: string, args: string[], cwd?: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { 
        cwd: cwd ? path.join(__dirname, cwd) : undefined,
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  private extractPassedCount(output: string): number {
    const match = output.match(/(\d+) passed/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractFailedCount(output: string): number {
    const match = output.match(/(\d+) failed/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractErrors(output: string): string[] {
    const errorLines = output.split('\n').filter(line => 
      line.includes('Error:') || line.includes('FAIL') || line.includes('✗')
    );
    return errorLines.slice(0, 10); // Limit to first 10 errors
  }

  private extractPlaywrightErrors(jsonReport: any): string[] {
    const errors: string[] = [];
    
    if (jsonReport.suites) {
      jsonReport.suites.forEach((suite: any) => {
        if (suite.specs) {
          suite.specs.forEach((spec: any) => {
            if (spec.tests) {
              spec.tests.forEach((test: any) => {
                if (test.results) {
                  test.results.forEach((result: any) => {
                    if (result.status === 'failed' && result.error) {
                      errors.push(`${test.title}: ${result.error.message}`);
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    
    return errors;
  }
}

// Run the integration tests
if (require.main === module) {
  const runner = new IntegrationTestRunner();
  runner.run().catch(error => {
    console.error('Integration test runner failed:', error);
    process.exit(1);
  });
}

export default IntegrationTestRunner;