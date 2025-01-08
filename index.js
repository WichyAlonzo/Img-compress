const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const inputDir = path.join(__dirname, 'img');
const outputDir = path.join(__dirname, 'output');

if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

async function compressImage(inputPath, outputPath, maxSizeMB = 3) {
    try {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        let quality = 100;

        let buffer = await sharp(inputPath)
            .jpeg({ quality })
            .toBuffer();

        while (buffer.length > maxSizeBytes && quality > 10) {
            quality -= 10;
            buffer = await sharp(inputPath)
                .jpeg({ quality })
                .toBuffer();
        }

        fs.writeFileSync(outputPath, buffer);
        return true;
    } catch (error) {
        console.error('Error al comprimir la imagen:', error);
        return false;
    }
}

async function compressImagesInFolder(inputDir, outputDir) {
    const files = fs.readdirSync(inputDir);
    const totalImages = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file)).length;
    let compressedCount = 0;

    console.log(`Total de imágenes: ${totalImages}`);

    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file);

        if (fs.lstatSync(inputPath).isFile() && /\.(jpg|jpeg|png)$/i.test(file)) {
            const result = await compressImage(inputPath, outputPath);
            if (result) {
                compressedCount++;
                const progress = Math.round((compressedCount / totalImages) * 100);
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`Comprimiendo imágenes... ${progress}% (${compressedCount}/${totalImages})`);
            }
        }
    }

    console.log('\nProceso de compresión finalizado.');
}

// Comprime todas las imágenes en la carpeta 'img' y las guarda en la carpeta 'output'
compressImagesInFolder(inputDir, outputDir);
