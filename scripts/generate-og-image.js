const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateOGImage() {
  const svgPath = path.join(__dirname, '../public/og-image.svg');
  const pngPath = path.join(__dirname, '../public/og-image.jpg');
  
  try {
    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Convert SVG to PNG and then to JPG
    await sharp(svgBuffer)
      .resize(1200, 630, {
        fit: 'contain',
        background: { r: 14, g: 165, b: 233, alpha: 1 } // #0ea5e9
      })
      .jpeg({ quality: 90 })
      .toFile(pngPath);
    
    console.log('✅ OG image generated successfully at:', pngPath);
  } catch (error) {
    console.error('❌ Error generating OG image:', error);
    process.exit(1);
  }
}

generateOGImage();


