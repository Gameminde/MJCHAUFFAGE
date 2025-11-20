#!/usr/bin/env node

/**
 * Mobile Performance Audit Script
 * Uses Lighthouse to test mobile performance and generates reports
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'mobile-audit');

class MobileAuditor {
  constructor() {
    this.results = [];
    this.chrome = null;
  }

  async init() {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('🚀 Starting Mobile Performance Audit...');
    console.log(`📍 Testing URL: ${BASE_URL}`);
    console.log(`📁 Reports will be saved to: ${OUTPUT_DIR}`);
  }

  async launchChrome() {
    console.log('🌐 Launching Chrome...');
    this.chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=375,667', // Mobile viewport
        '--user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"'
      ]
    });
  }

  async runLighthouse(url, name) {
    console.log(`📊 Running Lighthouse audit for: ${name}`);

    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: this.chrome.port,
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        disabled: false
      },
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4
      }
    };

    const runnerResult = await lighthouse(url, options);
    const report = runnerResult.report;
    const lhr = runnerResult.lhr;

    return { report, lhr, name, url };
  }

  async auditPages() {
    const pages = [
      { url: `${BASE_URL}/fr`, name: 'Homepage FR' },
      { url: `${BASE_URL}/ar`, name: 'Homepage AR' },
      { url: `${BASE_URL}/fr/products`, name: 'Products FR' },
      { url: `${BASE_URL}/ar/products`, name: 'Products AR' },
      { url: `${BASE_URL}/fr/about`, name: 'About FR' },
      { url: `${BASE_URL}/ar/about`, name: 'About AR' },
      { url: `${BASE_URL}/fr/contact`, name: 'Contact FR' },
      { url: `${BASE_URL}/ar/contact`, name: 'Contact AR' },
    ];

    for (const page of pages) {
      try {
        const result = await this.runLighthouse(page.url, page.name);
        this.results.push(result);

        // Save individual report
        const filename = `${page.name.toLowerCase().replace(/\s+/g, '-')}-mobile-report.json`;
        fs.writeFileSync(
          path.join(OUTPUT_DIR, filename),
          JSON.stringify(result.lhr, null, 2)
        );

        console.log(`✅ ${page.name}: Performance ${result.lhr.categories.performance.score * 100}/100`);

      } catch (error) {
        console.error(`❌ Failed to audit ${page.name}:`, error.message);
      }
    }
  }

  generateSummaryReport() {
    console.log('\n📋 Generating Summary Report...');

    const summary = {
      auditDate: new Date().toISOString(),
      baseUrl: BASE_URL,
      overall: {
        totalPages: this.results.length,
        averagePerformance: 0,
        averageAccessibility: 0,
        averageBestPractices: 0,
        averageSEO: 0,
        pagesAbove85: 0,
        pagesAbove90: 0
      },
      pages: [],
      recommendations: []
    };

    let totalPerf = 0;
    let totalAcc = 0;
    let totalBP = 0;
    let totalSEO = 0;

    this.results.forEach(result => {
      const perf = result.lhr.categories.performance.score * 100;
      const acc = result.lhr.categories.accessibility.score * 100;
      const bp = result.lhr.categories['best-practices'].score * 100;
      const seo = result.lhr.categories.seo.score * 100;

      totalPerf += perf;
      totalAcc += acc;
      totalBP += bp;
      totalSEO += seo;

      if (perf >= 85) summary.overall.pagesAbove85++;
      if (perf >= 90) summary.overall.pagesAbove90++;

      summary.pages.push({
        name: result.name,
        url: result.url,
        scores: {
          performance: perf,
          accessibility: acc,
          bestPractices: bp,
          seo: seo
        }
      });
    });

    summary.overall.averagePerformance = totalPerf / this.results.length;
    summary.overall.averageAccessibility = totalAcc / this.results.length;
    summary.overall.averageBestPractices = totalBP / this.results.length;
    summary.overall.averageSEO = totalSEO / this.results.length;

    // Generate recommendations
    if (summary.overall.averagePerformance < 85) {
      summary.recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Performance en dessous de 85',
        description: 'Optimiser les images, réduire le JavaScript, améliorer le caching'
      });
    }

    if (summary.overall.averageAccessibility < 90) {
      summary.recommendations.push({
        type: 'accessibility',
        priority: 'high',
        title: 'Accessibilité à améliorer',
        description: 'Ajouter des labels ARIA, améliorer le contraste, optimiser la navigation clavier'
      });
    }

    // Save summary report
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'mobile-audit-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    return summary;
  }

  printReport(summary) {
    console.log('\n🎯 Mobile Audit Results Summary');
    console.log('=' .repeat(50));
    console.log(`📊 Pages audited: ${summary.overall.totalPages}`);
    console.log(`🏆 Performance moyenne: ${summary.overall.averagePerformance.toFixed(1)}/100`);
    console.log(`♿ Accessibilité moyenne: ${summary.overall.averageAccessibility.toFixed(1)}/100`);
    console.log(`📱 Bonnes pratiques: ${summary.overall.averageBestPractices.toFixed(1)}/100`);
    console.log(`🔍 SEO moyen: ${summary.overall.averageSEO.toFixed(1)}/100`);
    console.log(`✅ Pages ≥85: ${summary.overall.pagesAbove85}/${summary.overall.totalPages}`);
    console.log(`🏅 Pages ≥90: ${summary.overall.pagesAbove90}/${summary.overall.totalPages}`);

    console.log('\n📄 Page by page results:');
    summary.pages.forEach(page => {
      const status = page.scores.performance >= 85 ? '✅' : '❌';
      console.log(`${status} ${page.name}: ${page.scores.performance.toFixed(1)} (P: ${page.scores.performance.toFixed(1)}, A: ${page.scores.accessibility.toFixed(1)})`);
    });

    if (summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      summary.recommendations.forEach(rec => {
        console.log(`🔧 [${rec.priority.toUpperCase()}] ${rec.title}: ${rec.description}`);
      });
    }

    console.log(`\n📁 Reports saved to: ${OUTPUT_DIR}`);
  }

  async cleanup() {
    if (this.chrome) {
      await this.chrome.kill();
    }
  }

  async run() {
    try {
      await this.init();
      await this.launchChrome();
      await this.auditPages();
      const summary = this.generateSummaryReport();
      this.printReport(summary);
    } catch (error) {
      console.error('❌ Audit failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new MobileAuditor();
  auditor.run().catch(console.error);
}

module.exports = MobileAuditor;

