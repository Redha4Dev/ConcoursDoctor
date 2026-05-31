const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. We replace keys and string values that contain dots.
  // We'll just read line by line and remove '.' from string literals inside quotes.
  let lines = content.split('\n');
  let newLines = lines.map(line => {
    // Basic regex to remove all '.' characters inside " " string definitions in these specific dictionary files
    // But we don't want to break formatting.
    // Instead of complex regex, let's just do a blanket replace for the known keys.
    return line.replace(/\./g, '');
  });
  
  content = newLines.join('\n');
  
  // 2. Add new Committee strings
  // "Unnamed Session", "Academic Year", "No active anonymity tasks scheduled"
  
  if (filePath.includes('en.js')) {
     content = content.replace('};', '  "Unnamed Session": "Unnamed Session",\n  "Academic Year": "Academic Year",\n  "No active anonymity tasks scheduled": "No active anonymity tasks scheduled",\n};');
  } else if (filePath.includes('ar.js')) {
     content = content.replace('};', '  "Unnamed Session": "جلسة غير مسماة",\n  "Academic Year": "السنة الدراسية",\n  "No active anonymity tasks scheduled": "لا توجد مهام إخفاء الهوية مجدولة",\n};');
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
}

processFile(path.join(__dirname, 'locales/en.js'));
processFile(path.join(__dirname, 'locales/ar.js'));

console.log('Successfully updated locales.');
