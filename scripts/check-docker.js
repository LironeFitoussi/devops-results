#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import { platform } from 'os';
import { lookup } from 'dns';
import { promisify } from 'util';

const lookupAsync = promisify(lookup);
const OS = platform();
const MAX_WAIT_TIME = 60000; // 60 seconds
const CHECK_INTERVAL = 2000; // Check every 2 seconds

async function checkInternetConnection() {
  console.log('🌐 Checking internet connection...\n');
  
  try {
    // Test DNS resolution of google.com
    let dnsWorks = false;
    try {
      await lookupAsync('google.com');
      console.log('   ✅ DNS resolution working (google.com)');
      dnsWorks = true;
    } catch (error) {
      console.error('   ❌ Cannot resolve google.com');
    }
    
    // Test connectivity to Google's DNS server (8.8.8.8)
    let pingWorks = false;
    try {
      // Try to ping 8.8.8.8 (cross-platform)
      const pingCommand = OS === 'win32' 
        ? 'ping -n 1 -w 2000 8.8.8.8' 
        : 'ping -c 1 -W 2 8.8.8.8';
      execSync(pingCommand, { stdio: 'ignore', timeout: 3000 });
      console.log('   ✅ Network connectivity working (8.8.8.8)');
      pingWorks = true;
    } catch (error) {
      console.error('   ❌ Cannot reach 8.8.8.8');
    }
    
    if (!dnsWorks && !pingWorks) {
      console.log('');
      return false;
    }
    
    console.log('');
    return true;
  } catch (error) {
    console.error('   ❌ Internet connectivity check failed');
    console.log('');
    return false;
  }
}

function checkDockerInstalled() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkDockerRunning() {
  try {
    execSync('docker ps', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function getDockerDesktopPath() {
  if (OS === 'win32') {
    // Common Docker Desktop paths on Windows
    const paths = [
      process.env.LOCALAPPDATA + '\\Docker\\Docker Desktop\\Docker Desktop.exe',
      process.env.PROGRAMFILES + '\\Docker\\Docker\\Docker Desktop.exe',
      process.env['PROGRAMFILES(X86)'] + '\\Docker\\Docker\\Docker Desktop.exe',
    ];
    
    for (const path of paths) {
      if (path && existsSync(path)) {
        return path;
      }
    }
    
    // Try to find it via shell command
    try {
      const result = execSync('where "Docker Desktop.exe"', { encoding: 'utf-8', stdio: 'pipe' });
      return result.trim().split('\n')[0];
    } catch (error) {
      return null;
    }
  } else if (OS === 'darwin') {
    // Mac paths
    const paths = [
      '/Applications/Docker.app',
      process.env.HOME + '/Applications/Docker.app',
    ];
    
    for (const path of paths) {
      if (existsSync(path)) {
        return path;
      }
    }
    return null;
  }
  return null;
}

function launchDockerDesktop() {
  console.log('🚀 Attempting to launch Docker Desktop...\n');
  
  try {
    if (OS === 'win32') {
      const dockerPath = getDockerDesktopPath();
      if (!dockerPath) {
        throw new Error('Docker Desktop executable not found');
      }
      
      console.log(`   Found Docker Desktop at: ${dockerPath}`);
      spawn(dockerPath, [], { detached: true, stdio: 'ignore' });
      console.log('   ✅ Docker Desktop launch command sent');
      
    } else if (OS === 'darwin') {
      const dockerPath = getDockerDesktopPath();
      if (!dockerPath) {
        throw new Error('Docker Desktop application not found');
      }
      
      console.log(`   Found Docker Desktop at: ${dockerPath}`);
      execSync(`open "${dockerPath}"`, { stdio: 'ignore' });
      console.log('   ✅ Docker Desktop launch command sent');
      
    } else if (OS === 'linux') {
      console.log('   Attempting to start Docker service...');
      try {
        execSync('sudo systemctl start docker', { stdio: 'pipe' });
        console.log('   ✅ Docker service started');
      } catch (error) {
        console.error('   ⚠️  Could not start Docker service automatically');
        console.error('   Please run: sudo systemctl start docker');
        throw error;
      }
    } else {
      throw new Error(`Unsupported operating system: ${OS}`);
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to launch Docker Desktop: ${error.message}`);
    return false;
  }
}

function waitForDocker(maxWaitTime = MAX_WAIT_TIME) {
  const startTime = Date.now();
  console.log('\n⏳ Waiting for Docker to start...');
  console.log('   (This may take up to 60 seconds)');
  
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      if (checkDockerRunning()) {
        clearInterval(checkInterval);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✅ Docker is now running! (took ${elapsed}s)\n`);
        resolve(true);
      } else if (Date.now() - startTime > maxWaitTime) {
        clearInterval(checkInterval);
        reject(new Error('Timeout waiting for Docker to start'));
      }
    }, CHECK_INTERVAL);
    
    // Show progress dots
    let dots = 0;
    const progressInterval = setInterval(() => {
      if (checkDockerRunning() || Date.now() - startTime > maxWaitTime) {
        clearInterval(progressInterval);
      } else {
        process.stdout.write('.');
        dots++;
        if (dots > 3) {
          process.stdout.write('\r   ');
          dots = 0;
        }
      }
    }, 500);
  });
}

async function checkDocker() {
  try {
    // Step 0: Check internet connection
    const hasInternet = await checkInternetConnection();
    if (!hasInternet) {
      console.error('\n❌ No internet connection detected!');
      console.error('\nDocker needs internet access to:');
      console.error('  - Pull images from Docker Hub');
      console.error('  - Authenticate with Docker registry');
      console.error('\nPlease check your internet connection and try again.');
      console.error('\nTroubleshooting:');
      console.error('  - Check if you\'re connected to the internet');
      console.error('  - Check if your firewall is blocking connections');
      console.error('  - Check if you need to configure a proxy');
      console.error('  - Try: ping google.com or ping 8.8.8.8');
      process.exit(1);
    }
    
    // Step 1: Check if Docker is installed
    if (!checkDockerInstalled()) {
      console.error('❌ Docker is not installed!');
      console.error('\nPlease install Docker Desktop:');
      console.error('  - Windows/Mac: https://www.docker.com/products/docker-desktop');
      console.error('  - Linux: Follow your distribution\'s package manager instructions');
      process.exit(1);
    }
    
    // Step 2: Check if Docker is running
    if (checkDockerRunning()) {
      console.log('✅ Docker is running\n');
      return true;
    }
    
    // Step 3: Docker is installed but not running - try to launch it
    console.log('⚠️  Docker Desktop is not running!\n');
    
    const launched = launchDockerDesktop();
    
    if (!launched) {
      console.error('\n❌ Could not launch Docker Desktop automatically.');
      console.error('\nPlease start Docker Desktop manually:');
      if (OS === 'win32') {
        console.error('  - Open Docker Desktop from Start Menu');
        console.error('  - Wait for it to fully start (whale icon in system tray)');
      } else if (OS === 'darwin') {
        console.error('  - Open Docker Desktop from Applications');
        console.error('  - Wait for it to fully start');
      } else {
        console.error('  - Start Docker service: sudo systemctl start docker');
      }
      process.exit(1);
    }
    
    // Step 4: Wait for Docker to be ready
    try {
      await waitForDocker();
      return true;
    } catch (error) {
      console.error(`\n❌ ${error.message}`);
      console.error('\nPlease ensure Docker Desktop is fully started and try again.');
      console.error('You can check Docker status by running: docker ps');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error('\nPlease check Docker installation and try again.');
    process.exit(1);
  }
}

// Run the check
checkDocker().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

