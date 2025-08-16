const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/i18n/locales/en.json');
const zhPath = path.join(__dirname, 'src/i18n/locales/zh.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const zhData = JSON.parse(fs.readFileSync(zhPath, 'utf8'));

const enKeys = Object.keys(enData);
const zhKeys = Object.keys(zhData);

console.log('EN文件键数量:', enKeys.length);
console.log('ZH文件键数量:', zhKeys.length);

const missingInZh = enKeys.filter(key => !zhKeys.includes(key));
const extraInZh = zhKeys.filter(key => !enKeys.includes(key));

console.log('\nZH文件缺少的键:');
missingInZh.forEach(key => console.log('  -', key));

console.log('\nZH文件多出的键:');
extraInZh.forEach(key => console.log('  +', key));

console.log('\n缺少的键数量:', missingInZh.length);
console.log('多出的键数量:', extraInZh.length);