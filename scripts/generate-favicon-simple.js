const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const INPUT_SVG = path.join(PUBLIC_DIR, 'favicon.svg');
const APPLE_SVG = path.join(PUBLIC_DIR, 'apple-icon.svg');
const OUTPUT_PNG = path.join(PUBLIC_DIR, 'favicon-32x32.png');
const OUTPUT_PNG16 = path.join(PUBLIC_DIR, 'favicon-16x16.png');
const OUTPUT_APPLE = path.join(PUBLIC_DIR, 'apple-icon.png');

async function generateFavicon() {
  try {
    console.log('开始生成favicon...');
    
    // 确保svg文件存在
    if (!fs.existsSync(INPUT_SVG)) {
      console.error('错误: favicon.svg 文件不存在!');
      return;
    }
    
    // 读取SVG内容
    const svgBuffer = fs.readFileSync(INPUT_SVG);
    
    // 生成32x32 PNG (主要favicon)
    console.log('生成 32x32 PNG...');
    const png32Buffer = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();
    
    fs.writeFileSync(OUTPUT_PNG, png32Buffer);
    console.log(`已保存: ${OUTPUT_PNG}`);
    
    // 生成16x16 PNG (小尺寸favicon)
    console.log('生成 16x16 PNG...');
    const png16Buffer = await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toBuffer();
    
    fs.writeFileSync(OUTPUT_PNG16, png16Buffer);
    console.log(`已保存: ${OUTPUT_PNG16}`);
    
    // 处理Apple Touch Icon
    if (fs.existsSync(APPLE_SVG)) {
      console.log('生成Apple Touch Icon...');
      const appleSvgBuffer = fs.readFileSync(APPLE_SVG);
      const applePngBuffer = await sharp(appleSvgBuffer)
        .resize(180, 180)
        .png()
        .toBuffer();
      
      fs.writeFileSync(OUTPUT_APPLE, applePngBuffer);
      console.log(`已保存: ${OUTPUT_APPLE}`);
    } else {
      console.warn('警告: apple-icon.svg 文件不存在, 跳过生成Apple Touch Icon');
    }
    
    console.log('所有图标生成完成!');
  } catch (error) {
    console.error('生成favicon时出错:', error);
  }
}

generateFavicon(); 