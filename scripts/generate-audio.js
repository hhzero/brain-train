/**
 * 生成n-back训练所需的音频文件
 * 创建不同频率的纯音调用于听觉刺激
 */

const fs = require('fs');
const path = require('path');

// 确保sounds目录存在
const soundsDir = path.join(__dirname, '../public/sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// 生成音频文件的说明
const audioInfo = {
  notes: [
    { name: 'tone1', frequency: 440, description: 'A4 - 440Hz' },
    { name: 'tone2', frequency: 523, description: 'C5 - 523Hz' },
    { name: 'tone3', frequency: 659, description: 'E5 - 659Hz' },
    { name: 'tone4', frequency: 784, description: 'G5 - 784Hz' },
    { name: 'tone5', frequency: 880, description: 'A5 - 880Hz' },
    { name: 'tone6', frequency: 1047, description: 'C6 - 1047Hz' },
    { name: 'tone7', frequency: 1319, description: 'E6 - 1319Hz' },
    { name: 'tone8', frequency: 1568, description: 'G6 - 1568Hz' }
  ],
  effects: [
    { name: 'correct', description: '正确答案音效' },
    { name: 'incorrect', description: '错误答案音效' },
    { name: 'start', description: '开始训练音效' },
    { name: 'complete', description: '完成训练音效' }
  ]
};

// 创建音频信息文件
fs.writeFileSync(
  path.join(soundsDir, 'audio-info.json'),
  JSON.stringify(audioInfo, null, 2)
);

console.log('音频信息文件已创建：', path.join(soundsDir, 'audio-info.json'));
console.log('\n请手动添加以下音频文件到 public/sounds/ 目录：');
console.log('\n音调文件（用于听觉刺激）：');
audioInfo.notes.forEach(note => {
  console.log(`- ${note.name}.mp3 (${note.description})`);
});
console.log('\n音效文件：');
audioInfo.effects.forEach(effect => {
  console.log(`- ${effect.name}.mp3 (${effect.description})`);
});

console.log('\n或者使用在线音频生成工具创建这些文件。');