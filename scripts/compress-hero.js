const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '../frontend/public/images/hero-bg.png');
const outputPath = path.join(__dirname, '../frontend/public/images/hero-bg-optimized.webp');
const outputPngPath = path.join(__dirname, '../frontend/public/images/hero-bg-optimized.png');

async function compressImage() {
  try {
    const inputStats = fs.statSync(inputPath);
    console.log(`Original size: ${(inputStats.size / 1024 / 1024).toFixed(2)} MB`);

    // Create optimized WebP version (best for modern browsers)
    await sharp(inputPath)
      .resize(1920, 1080, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const webpStats = fs.statSync(outputPath);
    console.log(`WebP size: ${(webpStats.size / 1024).toFixed(2)} KB`);

    // Create optimized PNG version (fallback)
    await sharp(inputPath)
      .resize(1920, 1080, { fit: 'cover', withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(outputPngPath);

    const pngStats = fs.statSync(outputPngPath);
    console.log(`PNG size: ${(pngStats.size / 1024).toFixed(2)} KB`);

    // Replace original with optimized PNG
    fs.copyFileSync(outputPngPath, inputPath);
    
    // Clean up
    fs.unlinkSync(outputPngPath);

    const finalStats = fs.statSync(inputPath);
    console.log(`\nFinal hero-bg.png size: ${(finalStats.size / 1024).toFixed(2)} KB`);
    console.log(`Compression ratio: ${((1 - finalStats.size / inputStats.size) * 100).toFixed(1)}%`);
    console.log('\n✅ Image compressed successfully!');

  } catch (error) {
    console.error('Error compressing image:', error);
    process.exit(1);
  }
}

compressImage();

