const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const favicon = require('favicon');

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const INPUT_SVG = path.join(PUBLIC_DIR, 'favicon.svg');
const APPLE_SVG = path.join(PUBLIC_DIR, 'apple-icon.svg');
const OUTPUT_ICO = path.join(PUBLIC_DIR, 'favicon.ico');
const OUTPUT_PNG = path.join(PUBLIC_DIR, 'favicon.png');
const OUTPUT_APPLE = path.join(PUBLIC_DIR, 'apple-icon.png');

// 要生成的favicon尺寸
const SIZES = [16, 32, 48, 64, 128, 256];

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
    
    // 生成多尺寸PNG
    const pngBuffers = [];
    for (const size of SIZES) {
      console.log(`生成 ${size}x${size} PNG...`);
      const pngBuffer = await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer();
      
      pngBuffers.push({
        size: size,
        buffer: pngBuffer
      });
      
      // 保存最大尺寸的PNG作为备用
      if (size === Math.max(...SIZES)) {
        fs.writeFileSync(OUTPUT_PNG, pngBuffer);
        console.log(`已保存: ${OUTPUT_PNG}`);
      }
    }
    
    // 生成ICO文件
    console.log('生成ICO文件...');
    const icoOptions = pngBuffers.map(item => ({
      size: item.size,
      data: item.buffer
    }));
    
    const icoBuffer = favicon.fromPng(icoOptions);
    fs.writeFileSync(OUTPUT_ICO, icoBuffer);
    console.log(`已保存: ${OUTPUT_ICO}`);
    
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