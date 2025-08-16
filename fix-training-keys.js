const fs = require('fs');
const path = require('path');

// 读取英文和中文翻译文件
const enPath = path.join(__dirname, 'src/i18n/locales/en.json');
const zhPath = path.join(__dirname, 'src/i18n/locales/zh.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const zhData = JSON.parse(fs.readFileSync(zhPath, 'utf8'));

// 检查training键的差异
const enTraining = enData.training || {};
const zhTraining = zhData.training || {};

console.log('English training keys:', Object.keys(enTraining));
console.log('Chinese training keys:', Object.keys(zhTraining));

// 找出缺失的键
const missingKeys = [];
function findMissingKeys(enObj, zhObj, prefix = '') {
  for (const key in enObj) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (!(key in zhObj)) {
      missingKeys.push(currentPath);
    } else if (typeof enObj[key] === 'object' && enObj[key] !== null && !Array.isArray(enObj[key])) {
      findMissingKeys(enObj[key], zhObj[key] || {}, currentPath);
    }
  }
}

findMissingKeys(enTraining, zhTraining, 'training');
console.log('\nMissing training keys in zh.json:');
missingKeys.forEach(key => console.log(`- ${key}`));

// 添加缺失的键（使用英文作为占位符）
function addMissingKeys(enObj, zhObj) {
  for (const key in enObj) {
    if (!(key in zhObj)) {
      if (typeof enObj[key] === 'object' && enObj[key] !== null && !Array.isArray(enObj[key])) {
        zhObj[key] = {};
        addMissingKeys(enObj[key], zhObj[key]);
      } else {
        // 使用英文作为占位符，后续可以翻译
        zhObj[key] = enObj[key];
      }
    } else if (typeof enObj[key] === 'object' && enObj[key] !== null && !Array.isArray(enObj[key])) {
      addMissingKeys(enObj[key], zhObj[key]);
    }
  }
}

addMissingKeys(enTraining, zhTraining);

// 更新zh.json
zhData.training = zhTraining;

// 写回文件
fs.writeFileSync(zhPath, JSON.stringify(zhData, null, 2), 'utf8');
console.log('\nFixed zh.json training keys!');
console.log('Updated Chinese training keys:', Object.keys(zhTraining));