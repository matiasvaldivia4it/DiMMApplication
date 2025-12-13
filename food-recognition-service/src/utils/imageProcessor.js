const sharp = require('sharp');

const processImage = async (buffer) => {
    try {
        // Resize and optimize image
        const processedBuffer = await sharp(buffer)
            .resize(1024, 1024, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({
                quality: 85,
                progressive: true,
            })
            .toBuffer();

        return processedBuffer;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};

const imageToBase64 = (buffer) => {
    return buffer.toString('base64');
};

module.exports = {
    processImage,
    imageToBase64,
};
