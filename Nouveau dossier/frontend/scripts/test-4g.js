#!/usr/bin/env node

/**
 * 4G Network Simulation Test
 * Simulates slow 4G network conditions and tests mobile performance
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const compression = require('compression');

class NetworkSimulator {
  constructor() {
    this.app = express();
    this.server = null;
  }

  setupMiddleware() {
    // Enable compression
    this.app.use(compression());

    // Simulate 4G network latency (150ms RTT)
    this.app.use((req, res, next) => {
      setTimeout(next, Math.random() * 150 + 50); // 50-200ms random delay
    });

    // Simulate bandwidth limitation (1.6 Mbps = ~200 KB/s)
    this.app.use((req, res, next) => {
      const originalWrite = res.write;
      const originalEnd = res.end;
      let totalBytes = 0;
      const maxBytesPerSecond = 200 * 1024; // 200 KB/s
      const chunkDelay = 1000; // 1 second chunks

      res.write = function(chunk, encoding, callback) {
        totalBytes += chunk.length;

        // Simulate bandwidth throttling
        if (totalBytes > maxBytesPerSecond) {
          setTimeout(() => {
            totalBytes = 0;
            originalWrite.call(this, chunk, encoding, callback);
          }, chunkDelay);
          return true;
        }

        return originalWrite.call(this, chunk, encoding, callback);
      };

      res.end = function(chunk, encoding, callback) {
        if (chunk) {
          totalBytes += chunk.length;
        }
        return originalEnd.call(this, chunk, encoding, callback);
      };

      next();
    });

    // Proxy to Next.js dev server
    this.app.use(
      '/',
      createProxyMiddleware({
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      })
    );
  }

  start(port = 3001) {
    this.setupMiddleware();

    return new Promise((resolve) => {
      this.server = this.app.listen(port, () => {
        console.log(`🌐 4G Network Simulator running on http://localhost:${port}`);
        console.log(`📊 Simulating: 4G (150ms RTT, 1.6 Mbps)`);
        console.log(`🎯 Target server: http://localhost:3000`);
        console.log(`\n📱 Test URLs:`);
        console.log(`   http://localhost:${port}/fr`);
        console.log(`   http://localhost:${port}/fr/products`);
        console.log(`   http://localhost:${port}/fr/about`);
        console.log(`\n🔧 Run Lighthouse against this URL for realistic mobile testing`);
        resolve(this.server);
      });
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 4G Network Simulator stopped');
    }
  }
}

// CLI interface
async function main() {
  const simulator = new NetworkSimulator();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⏹️  Shutting down 4G simulator...');
    simulator.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n⏹️  Shutting down 4G simulator...');
    simulator.stop();
    process.exit(0);
  });

  try {
    await simulator.start();

    console.log(`\n💡 Tips for testing:`);
    console.log(`   1. Open http://localhost:3001/fr in a new tab`);
    console.log(`   2. Use Chrome DevTools > Network > Throttling > Fast 3G`);
    console.log(`   3. Run Lighthouse on the simulated URL`);
    console.log(`   4. Compare with direct localhost:3000 access`);
    console.log(`\n🚀 Ready for testing!`);

  } catch (error) {
    console.error('❌ Failed to start network simulator:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = NetworkSimulator;

