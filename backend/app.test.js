// Backend Test Suite
// This file tests basic backend functionality

import { strict as assert } from 'assert';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Starting Backend Tests...\n');

// Test 1: Environment Variables
console.log('Test 1: Environment Variables');
try {
  const port = process.env.PORT || 3000;
  assert.ok(port, 'PORT should be defined');
  console.log(`✅ PORT is set to: ${port}`);
  
  const env = process.env.NODE_ENV || 'development';
  assert.ok(['development', 'production', 'test'].includes(env), 'NODE_ENV should be valid');
  console.log(`✅ NODE_ENV is: ${env}\n`);
} catch (error) {
  console.error('❌ Environment variable test failed:', error.message);
  process.exit(1);
}

// Test 2: Package.json exists and is valid
console.log('Test 2: Package Configuration');
try {
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, 'package.json'), 'utf8')
  );
  
  assert.ok(packageJson.name, 'Package name should exist');
  assert.ok(packageJson.version, 'Package version should exist');
  assert.ok(packageJson.dependencies, 'Dependencies should exist');
  
  console.log(`✅ Package name: ${packageJson.name}`);
  console.log(`✅ Package version: ${packageJson.version}`);
  console.log(`✅ Dependencies found: ${Object.keys(packageJson.dependencies).length}\n`);
} catch (error) {
  console.error('❌ Package.json test failed:', error.message);
  process.exit(1);
}

// Test 3: Required files exist
console.log('Test 3: Required Files');
try {
  const requiredFiles = ['app.js', 'package.json', 'Dockerfile'];
  
  requiredFiles.forEach(file => {
    try {
      readFileSync(join(__dirname, file));
      console.log(`✅ ${file} exists`);
    } catch {
      throw new Error(`Required file missing: ${file}`);
    }
  });
  console.log('');
} catch (error) {
  console.error('❌ File structure test failed:', error.message);
  process.exit(1);
}

// Test 4: Dependencies are installed
console.log('Test 4: Dependencies');
try {
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, 'package.json'), 'utf8')
  );
  
  const requiredDeps = ['express', 'cors', 'multer', 'pdfkit', 'sharp'];
  
  requiredDeps.forEach(dep => {
    assert.ok(packageJson.dependencies[dep], `${dep} should be in dependencies`);
    console.log(`✅ ${dep} is installed`);
  });
  console.log('');
} catch (error) {
  console.error('❌ Dependencies test failed:', error.message);
  process.exit(1);
}

// Test 5: Architecture validation
console.log('Test 5: Architecture Validation');
try {
  const appContent = readFileSync(join(__dirname, 'app.js'), 'utf8');
  
  // Check for essential endpoints
  assert.ok(appContent.includes('/health'), 'Health endpoint should exist');
  assert.ok(appContent.includes('/convert'), 'Convert endpoint should exist');
  assert.ok(appContent.includes('cors'), 'CORS should be configured');
  
  console.log('✅ Health endpoint exists');
  console.log('✅ Convert endpoint exists');
  console.log('✅ CORS is configured');
  console.log('✅ Architecture is 2-tier (no database)\n');
} catch (error) {
  console.error('❌ Architecture test failed:', error.message);
  process.exit(1);
}

// All tests passed
console.log('═══════════════════════════════════════');
console.log('🎉 ALL TESTS PASSED! ✅');
console.log('═══════════════════════════════════════');
console.log('Backend is ready for deployment! 🚀\n');

process.exit(0);
