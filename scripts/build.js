#!/usr/bin/env node

/**
 * Build Script
 * 
 * This script builds both Server and Client in parallel
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔨 Starting build process for both Server and Client...\n');

// Build both in parallel
const buildServer = spawn('npm', ['run', 'build'], {
  cwd: join(rootDir, 'Server'),
  stdio: 'pipe',
  shell: true
});

const buildClient = spawn('npm', ['run', 'build'], {
  cwd: join(rootDir, 'Client'),
  stdio: 'pipe',
  shell: true
});

// Handle Server output
buildServer.stdout.on('data', (data) => {
  process.stdout.write(`[Server] ${data}`);
});

buildServer.stderr.on('data', (data) => {
  process.stderr.write(`[Server] ${data}`);
});

// Handle Client output
buildClient.stdout.on('data', (data) => {
  process.stdout.write(`[Client] ${data}`);
});

buildClient.stderr.on('data', (data) => {
  process.stderr.write(`[Client] ${data}`);
});

// Wait for both to complete
try {
  await Promise.all([
    new Promise((resolve, reject) => {
      buildServer.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Server build failed with code ${code}`));
        } else {
          resolve('Server');
        }
      });
    }),
    new Promise((resolve, reject) => {
      buildClient.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Client build failed with code ${code}`));
        } else {
          resolve('Client');
        }
      });
    })
  ]);
  console.log('\n   ✅ All builds completed successfully!\n');
} catch (error) {
  console.error(`\n   ❌ ${error.message}`);
  process.exit(1);
}

console.log('✨ Build process completed successfully!\n');


