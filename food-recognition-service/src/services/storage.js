const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'minio',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = 'food-images';

const initStorage = async () => {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
            console.log(`Bucket ${BUCKET_NAME} created successfully`);
        } else {
            console.log(`Bucket ${BUCKET_NAME} already exists`);
        }
    } catch (error) {
        console.error('Error initializing MinIO:', error);
        throw error;
    }
};

const uploadImage = async (fileName, buffer, contentType) => {
    try {
        await minioClient.putObject(BUCKET_NAME, fileName, buffer, buffer.length, {
            'Content-Type': contentType,
        });
        return fileName;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

const getImageUrl = (fileName) => {
    return `http://${process.env.MINIO_ENDPOINT || 'minio:9000'}/${BUCKET_NAME}/${fileName}`;
};

const getImage = async (fileName) => {
    try {
        const dataStream = await minioClient.getObject(BUCKET_NAME, fileName);
        const chunks = [];

        return new Promise((resolve, reject) => {
            dataStream.on('data', (chunk) => chunks.push(chunk));
            dataStream.on('end', () => resolve(Buffer.concat(chunks)));
            dataStream.on('error', reject);
        });
    } catch (error) {
        console.error('Error getting image:', error);
        throw error;
    }
};

module.exports = {
    initStorage,
    uploadImage,
    getImageUrl,
    getImage,
};
