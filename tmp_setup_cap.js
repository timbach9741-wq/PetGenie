const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Installing Capacitor dependencies...");
  execSync('npm install @capacitor/core @capacitor/cli @capacitor/android', { stdio: 'inherit' });

  console.log("Creating capacitor.config.ts...");
  fs.writeFileSync('capacitor.config.ts', `
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.petgenie.app',
  appName: 'Pet Genie',
  webDir: 'dist'
};

export default config;
  `);

  console.log("Building React App (npm run build)...");
  execSync('npm run build', { stdio: 'inherit' });

  console.log("Adding Android platform...");
  execSync('npx cap add android', { stdio: 'inherit' });

  console.log("Capacitor setup & Android Native Bridge extraction complete!");
} catch (error) {
  console.error("Setup failed:", error.message);
}
