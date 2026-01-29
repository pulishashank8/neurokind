const fs = require('fs');
const path = require('path');

function getAllTestFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllTestFiles(filePath, fileList);
    } else if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const testFiles = getAllTestFiles('src/__tests__');

testFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Check if file already imports resetMockData
  const hasResetMockData = content.includes("import { resetMockData } from '../setup'") || content.includes("import { resetMockData } from '../setup';");

  // Remove vitest imports
  const vitestImportRegex = /^import\s+\{[^}]+\}\s+from\s+['"]vitest['"];?\s*\n/gm;
  content = content.replace(vitestImportRegex, '');

  // Add resetMockData import if not present and file has beforeEach
  if (!hasResetMockData && content.includes('beforeEach')) {
    // Find first import statement
    const firstImportMatch = content.match(/^import\s/m);
    if (firstImportMatch) {
      const insertPos = firstImportMatch.index;
      content = content.slice(0, insertPos) +
                "import { resetMockData } from '../setup';\n" +
                content.slice(insertPos);
    }
  }

  // Add resetMockData() call to beforeEach if it exists and doesn't already have it
  if (content.includes('beforeEach') && !content.includes('resetMockData()')) {
    content = content.replace(
      /(beforeEach\((?:async\s+)?\(\)\s*=>\s*\{)/g,
      '$1\n        resetMockData();'
    );
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Fixed: ${path.basename(file)}`);
});

console.log(`\nFixed ${testFiles.length} test files`);
