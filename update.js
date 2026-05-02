const fs = require('fs');
const path = require('path');
const slidesDir = path.join(process.cwd(), 'components', 'slides');
const files = fs.readdirSync(slidesDir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(slidesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Frosted glass background
    content = content.replace(
      /bg-white p-(\d+)(?: md:p-(\d+))? rounded-2xl shadow-sm border border-slate-200/g,
      (match, p1, p2) => `bg-white/70 backdrop-blur-[10px] border border-white/50 p-${p1}${p2 ? ' md:p-' + p2 : ''} rounded-[24px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]`
    );
    
    // Intro start button styling
    content = content.replace(
      /bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-\d{3} transition-colors shadow-\w+ shadow-blue-\d+/g,
      'bg-blue-500 text-white rounded-[10px] font-semibold hover:bg-blue-600 transition-all shadow-sm'
    );
    
    fs.writeFileSync(filePath, content);
  }
});

// Update main app background
const pagePath = path.join(process.cwd(), 'app', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');
pageContent = pageContent.replace(/bg-slate-50/g, 'bg-[#F0F2F5]').replace(/text-slate-900/g, 'text-[#1E293B]');
fs.writeFileSync(pagePath, pageContent);

console.log('Update complete!');
