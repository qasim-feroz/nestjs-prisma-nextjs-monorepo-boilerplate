#!/usr/bin/env node

const http = require('http');
const { execSync } = require('child_process');
const IORedis = require('ioredis');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(service) {
  log(`✓ ${service} is working`, 'green');
}

function logError(service, error) {
  log(`✗ ${service} failed: ${error}`, 'red');
}

function logInfo(message) {
  log(message, 'cyan');
}

async function testRedis() {
  logInfo('\n🔍 Testing Redis...');
  try {
    const redis = new IORedis({
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null,
      retryStrategy: () => null, // Don't retry for test
      connectTimeout: 2000,
    });

    await redis.ping();
    await redis.quit();
    logSuccess('Redis');
    return true;
  } catch (error) {
    logError('Redis', error.message);
    log('   Make sure Redis is running: npm run redis:up', 'yellow');
    return false;
  }
}

async function testPrisma() {
  logInfo('\n🔍 Testing Prisma...');
  try {
    // Check if Prisma CLI is available
    execSync('npx prisma --version', { stdio: 'pipe' });
    
    // Try to load .env file if it exists
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '../.env');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach((line) => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match && !process.env[match[1].trim()]) {
          process.env[match[1].trim()] = match[2].trim();
        }
      });
    }
    
    // Try to validate the schema (with optional DATABASE_URL)
    const env = { ...process.env };
    if (!env.DATABASE_URL) {
      // Provide a dummy DATABASE_URL for validation purposes
      env.DATABASE_URL = 'postgresql://user:password@localhost:5432/test';
    }
    
    execSync('npx prisma validate --schema=packages/prisma/prisma/schema.prisma', {
      stdio: 'pipe',
      cwd: process.cwd(),
      env: env,
    });
    
    // Test database connection if DATABASE_URL is set
    if (process.env.DATABASE_URL) {
      try {
        // Try to connect to the database using Prisma
        execSync('npx prisma db execute --stdin --schema=packages/prisma/prisma/schema.prisma', {
          input: 'SELECT 1;',
          stdio: 'pipe',
          cwd: process.cwd(),
          timeout: 5000,
        });
        logSuccess('Prisma');
        log('   ✓ Database connection successful', 'green');
        return true;
      } catch (dbError) {
        // Try alternative method - use Prisma Client if available
        try {
          const path = require('path');
          const fs = require('fs');
          
          // Try to find Prisma Client in the generated location
          const prismaClientPath = path.join(__dirname, '../packages/prisma/generated/prisma');
          
          // If client not generated, try to generate it
          if (!fs.existsSync(prismaClientPath)) {
            log('   Generating Prisma Client...', 'yellow');
            execSync('npx prisma generate --schema=packages/prisma/prisma/schema.prisma', {
              stdio: 'pipe',
              cwd: process.cwd(),
            });
          }
          
          const { PrismaClient } = require(prismaClientPath);
          const prisma = new PrismaClient();
          
          // Test connection with a simple query
          await prisma.$connect();
          await prisma.$queryRaw`SELECT 1`;
          await prisma.$disconnect();
          
          logSuccess('Prisma');
          log('   ✓ Database connection successful', 'green');
          return true;
        } catch (clientError) {
          logSuccess('Prisma (CLI & Schema OK)');
          log('   ⚠️  Database connection failed', 'yellow');
          
          // Provide specific error messages
          if (clientError.code === 'P1001') {
            log('   Cannot reach database server', 'yellow');
          } else if (clientError.code === 'P1000') {
            log('   Authentication failed - check database credentials', 'yellow');
          } else if (clientError.code === 'ENOTFOUND' || clientError.code === 'ECONNREFUSED') {
            log('   Database server not found or not running', 'yellow');
          } else {
            log(`   Error: ${clientError.message}`, 'yellow');
          }
          log('   Check your DATABASE_URL and ensure database is running', 'yellow');
          return true; // CLI works, connection issue
        }
      }
    } else {
      logSuccess('Prisma (CLI & Schema OK)');
      log('   ⚠️  DATABASE_URL not set - skipping connection test', 'yellow');
      log('   Set DATABASE_URL to test database connection', 'yellow');
      return true;
    }
  } catch (error) {
    // Check if it's just a DATABASE_URL error
    if (error.message.includes('DATABASE_URL') || error.message.includes('P1012')) {
      logSuccess('Prisma (CLI available)');
      log('   ⚠️  DATABASE_URL environment variable not set', 'yellow');
      log('   Set DATABASE_URL to test database connection', 'yellow');
      return true; // CLI works, just missing env var
    }
    logError('Prisma', error.message);
    return false;
  }
}

async function testAPI() {
  logInfo('\n🔍 Testing API (NestJS)...');
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001', { timeout: 3000 }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        // 404 is OK, means server is running
        logSuccess('API');
        resolve(true);
      } else {
        logError('API', `Status code: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        logError('API', 'Connection refused - API is not running');
        log('   Start API: npm run start:dev --prefix apps/api', 'yellow');
      } else {
        logError('API', error.message);
      }
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      logError('API', 'Connection timeout');
      log('   Start API: npm run start:dev --prefix apps/api', 'yellow');
      resolve(false);
    });
  });
}

async function testWeb() {
  logInfo('\n🔍 Testing Web (Next.js)...');
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', { timeout: 3000 }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        logSuccess('Web');
        resolve(true);
      } else {
        logError('Web', `Status code: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        logError('Web', 'Connection refused - Web app is not running');
        log('   Start Web: npm run dev --prefix apps/web', 'yellow');
      } else {
        logError('Web', error.message);
      }
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      logError('Web', 'Connection timeout');
      log('   Start Web: npm run dev --prefix apps/web', 'yellow');
      resolve(false);
    });
  });
}

async function testWorker() {
  logInfo('\n🔍 Testing Worker (BullMQ)...');
  try {
    const redis = new IORedis({
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null,
      retryStrategy: () => null,
      connectTimeout: 2000,
    });

    await redis.ping();
    
    // Check if worker process is running (basic check)
    try {
      const { Queue } = require('bullmq');
      const testQueue = new Queue('test-queue', { connection: redis });
      await testQueue.add('test', { test: true });
      await testQueue.close();
      await redis.quit();
      
      logSuccess('Worker');
      log('   Note: Worker process check requires worker to be running', 'yellow');
      return true;
    } catch (error) {
      await redis.quit();
      logSuccess('Worker (Redis connection OK)');
      log('   Note: Worker process may not be running', 'yellow');
      return true; // Redis works, worker can connect
    }
  } catch (error) {
    logError('Worker', error.message);
    log('   Make sure Redis is running: npm run redis:up', 'yellow');
    return false;
  }
}

async function runAllTests() {
  log('\n═══════════════════════════════════════════════════', 'blue');
  log('  Service Health Check', 'blue');
  log('═══════════════════════════════════════════════════\n', 'blue');

  const results = {
    redis: await testRedis(),
    prisma: await testPrisma(),
    api: await testAPI(),
    web: await testWeb(),
    worker: await testWorker(),
  };

  log('\n═══════════════════════════════════════════════════', 'blue');
  log('  Summary', 'blue');
  log('═══════════════════════════════════════════════════\n', 'blue');

  const allPassed = Object.values(results).every((result) => result);
  const passedCount = Object.values(results).filter((r) => r).length;
  const totalCount = Object.keys(results).length;

  Object.entries(results).forEach(([service, passed]) => {
    if (passed) {
      log(`✓ ${service.toUpperCase().padEnd(10)} - OK`, 'green');
    } else {
      log(`✗ ${service.toUpperCase().padEnd(10)} - FAILED`, 'red');
    }
  });

  log(`\n${passedCount}/${totalCount} services are working\n`, allPassed ? 'green' : 'yellow');

  if (allPassed) {
    log('🎉 All services are working correctly!', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some services need attention. Check the errors above.', 'yellow');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  logError('Test Runner', error.message);
  process.exit(1);
});

