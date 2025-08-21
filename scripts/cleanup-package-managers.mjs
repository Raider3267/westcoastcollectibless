#!/usr/bin/env node
/**
 * Cleanup script for removing conflicting package manager files
 * This ensures only pnpm is used in the project
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const CONFLICTING_FILES = [
  'package-lock.json',
  'yarn.lock',
  'npm-shrinkwrap.json'
];

const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${COLORS.reset}`);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Failed to delete ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  log(COLORS.blue, '🧹 Cleaning up conflicting package manager files...\n');
  
  let foundConflicts = false;
  let deletedFiles = [];
  let failedDeletions = [];

  // Check for conflicting files
  for (const file of CONFLICTING_FILES) {
    const filePath = join(projectRoot, file);
    if (await fileExists(filePath)) {
      foundConflicts = true;
      log(COLORS.yellow, `⚠️  Found conflicting file: ${file}`);
      
      if (await deleteFile(filePath)) {
        deletedFiles.push(file);
        log(COLORS.green, `✅ Deleted: ${file}`);
      } else {
        failedDeletions.push(file);
        log(COLORS.red, `❌ Failed to delete: ${file}`);
      }
    }
  }

  // Check for pnpm-lock.yaml
  const pnpmLockPath = join(projectRoot, 'pnpm-lock.yaml');
  if (!(await fileExists(pnpmLockPath))) {
    log(COLORS.red, '\n❌ Warning: pnpm-lock.yaml not found!');
    log(COLORS.yellow, '   Run "pnpm install" to generate it.');
  } else {
    log(COLORS.green, '\n✅ pnpm-lock.yaml exists');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  
  if (!foundConflicts) {
    log(COLORS.green, '✅ No conflicting package manager files found!');
    log(COLORS.green, '   Project is properly configured for pnpm.');
  } else {
    if (deletedFiles.length > 0) {
      log(COLORS.green, `✅ Successfully deleted: ${deletedFiles.join(', ')}`);
    }
    if (failedDeletions.length > 0) {
      log(COLORS.red, `❌ Failed to delete: ${failedDeletions.join(', ')}`);
      process.exit(1);
    }
  }

  // Developer guidance
  console.log('\n' + COLORS.blue + 'Developer Guidelines:' + COLORS.reset);
  console.log('• Only use "pnpm install" for dependencies');
  console.log('• Never run "npm install" or "yarn install"');
  console.log('• If you see package-lock.json or yarn.lock, run this script');
  console.log('• Use "pnpm run <script>" instead of "npm run <script>"');
  
  log(COLORS.green, '\n🎉 Cleanup complete!');
}

main().catch(error => {
  log(COLORS.red, `\n💥 Script failed: ${error.message}`);
  process.exit(1);
});