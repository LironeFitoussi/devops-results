#!/usr/bin/env node

/**
 * Boot Script
 *
 * This script:
 * 1. Prompts the user to customize container names, image names, ports, and network name
 * 2. Applies chosen values to Server/compose.yml and Client/compose.yml
 * 3. Copies .env.example to .env in both Server and Client directories (if .env doesn't exist)
 * 4. Runs npm install in both Server and Client directories
 */

import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question, defaultValue) {
  return new Promise((resolve) => {
    rl.question(`   ${question} (${defaultValue}): `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

console.log('🚀 Starting boot process...\n');

// Step 1: Customize Docker names and ports
console.log('🐳 Docker configuration (press Enter to keep defaults):\n');

const serverContainer = await ask('Server container name', 'mern-server');
const clientContainer = await ask('Client container name', 'mern-client');
const serverImage = await ask('Server image name', '');
const clientImage = await ask('Client image name', '');
const serverPort = await ask('Server port', '3000');
const clientPort = await ask('Client port', '5173');
const networkName = await ask('Network name', 'mern-network');

rl.close();

console.log('\n📝 Applying Docker configuration...');

const serverCompose = join(rootDir, 'Server', 'compose.yml');
const clientCompose = join(rootDir, 'Client', 'compose.yml');

// Apply to Server/compose.yml
let serverYml = readFileSync(serverCompose, 'utf-8');
serverYml = serverYml.replace('container_name: mern-server', `container_name: ${serverContainer}`);
serverYml = serverYml.replace('"3000:3000"', `"${serverPort}:3000"`);
serverYml = serverYml.replaceAll('mern-network', networkName);
if (serverImage) {
  serverYml = serverYml.replace('container_name:', `image: ${serverImage}\n    container_name:`);
}
writeFileSync(serverCompose, serverYml);

// Apply to Client/compose.yml
let clientYml = readFileSync(clientCompose, 'utf-8');
clientYml = clientYml.replace('container_name: mern-client', `container_name: ${clientContainer}`);
clientYml = clientYml.replace('"5173:5173"', `"${clientPort}:5173"`);
clientYml = clientYml.replace(/mern-network/g, networkName);
if (clientImage) {
  clientYml = clientYml.replace('container_name:', `image: ${clientImage}\n    container_name:`);
}
writeFileSync(clientCompose, clientYml);

console.log('   ✅ Docker configuration applied\n');

// Step 2: Copy .env.example to .env files
console.log('📋 Setting up environment files...');

const ServerEnvExample = join(rootDir, 'Server', '.env.example');
const ServerEnv = join(rootDir, 'Server', '.env');
const ClientEnvExample = join(rootDir, 'Client', '.env.example');
const ClientEnv = join(rootDir, 'Client', '.env');

// Server .env
if (existsSync(ServerEnvExample)) {
  if (existsSync(ServerEnv)) {
    console.log('   ⚠️  Server/.env already exists, skipping...');
  } else {
    copyFileSync(ServerEnvExample, ServerEnv);
    console.log('   ✅ Created Server/.env from Server/.env.example');
  }
} else {
  console.log('   ⚠️  Server/.env.example not found, skipping...');
}

// Client .env
if (existsSync(ClientEnvExample)) {
  if (existsSync(ClientEnv)) {
    console.log('   ⚠️  Client/.env already exists, skipping...');
  } else {
    copyFileSync(ClientEnvExample, ClientEnv);
    console.log('   ✅ Created Client/.env from Client/.env.example');
  }
} else {
  console.log('   ⚠️  Client/.env.example not found, skipping...');
}

console.log('\n📦 Installing dependencies for both Server and Client in parallel...\n');

// Step 3: Install dependencies in parallel

const installServer = spawn('npm', ['install'], {
  cwd: join(rootDir, 'Server'),
  stdio: 'pipe',
  shell: true
});

const installClient = spawn('npm', ['install'], {
  cwd: join(rootDir, 'Client'),
  stdio: 'pipe',
  shell: true
});

// Handle Server output
installServer.stdout.on('data', (data) => {
  process.stdout.write(`[Server] ${data}`);
});

installServer.stderr.on('data', (data) => {
  process.stderr.write(`[Server] ${data}`);
});

// Handle Client output
installClient.stdout.on('data', (data) => {
  process.stdout.write(`[Client] ${data}`);
});

installClient.stderr.on('data', (data) => {
  process.stderr.write(`[Client] ${data}`);
});

// Wait for both to complete
try {
  await Promise.all([
    new Promise((resolve, reject) => {
      installServer.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Server npm install failed with code ${code}`));
        } else {
          resolve('Server');
        }
      });
    }),
    new Promise((resolve, reject) => {
      installClient.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Client npm install failed with code ${code}`));
        } else {
          resolve('Client');
        }
      });
    })
  ]);
  console.log('\n   ✅ All dependencies installed successfully!\n');
} catch (error) {
  console.error(`\n   ❌ ${error.message}`);
  process.exit(1);
}

console.log('✨ Boot process completed successfully!');
console.log('\n📝 Next steps:');
console.log('   1. Edit Server/.env with your actual values');
console.log('   2. Edit Client/.env with your actual values');
console.log('   3. Run "npm run dev" to start with Docker\n');

