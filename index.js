const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'img');
const outputDir = path.join(__dirname, 'output');

if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

async function compressImage(inputPath, outputPath, maxSizeMB = 3) {
    try {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        let quality = 100;
        let buffer = await sharp(inputPath).jpeg({ quality }).toBuffer();
        
        // Reduce quality until the image is below the max size
        while (buffer.length > maxSizeBytes && quality > 10) {
            quality -= 10;
            buffer = await sharp(inputPath).jpeg({ quality }).toBuffer();
        }
        
        fs.writeFileSync(outputPath, buffer);
        console.log(`Image compressed and saved to ${outputPath}`);
    } catch (error) {
        console.error('Error compressing image:', error);
    }
}

async function compressImagesInFolder(inputDir, outputDir) {
    const files = fs.readdirSync(inputDir);
    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file);

        if (fs.lstatSync(inputPath).isFile() && /\.(jpg|jpeg|png)$/i.test(file)) {
            await compressImage(inputPath, outputPath);
        }
    }
}

// Compress all images in the 'img' folder and save them to the 'output' folder
compressImagesInFolder(inputDir, outputDir);
