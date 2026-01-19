import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = './client/public/products';
const outputDir = './client/public/products-optimized';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all jpg files
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.jpg'));

console.log(`Found ${files.length} images to optimize...\n`);

let totalOriginal = 0;
let totalOptimized = 0;

for (const file of files) {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);
  
  const originalSize = fs.statSync(inputPath).size;
  totalOriginal += originalSize;
  
  await sharp(inputPath)
    .resize(800, 800, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ 
      quality: 80,
      progressive: true 
    })
    .toFile(outputPath);
  
  const optimizedSize = fs.statSync(outputPath).size;
  totalOptimized += optimizedSize;
  
  const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
  console.log(`✅ ${file}: ${(originalSize/1024/1024).toFixed(2)} MB → ${(optimizedSize/1024).toFixed(0)} KB (${savings}% smaller)`);
}

console.log(`\n📊 Summary:`);
console.log(`   Original total: ${(totalOriginal/1024/1024).toFixed(2)} MB`);
console.log(`   Optimized total: ${(totalOptimized/1024/1024).toFixed(2)} MB`);
console.log(`   Saved: ${((1 - totalOptimized/totalOriginal) * 100).toFixed(1)}%`);
console.log(`\n✅ Optimized images saved to: ${outputDir}`);
console.log(`\n👉 Next: Replace old images with optimized ones`);

