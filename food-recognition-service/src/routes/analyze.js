const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { analyzeFood } = require('../services/claude');
const { uploadImage, getImageUrl } = require('../services/storage');
const { processImage, imageToBase64 } = require('../utils/imageProcessor');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

// Analyze food image
router.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const userId = req.headers['x-user-id'] || 'anonymous';

        // Process image
        const processedBuffer = await processImage(req.file.buffer);

        // Convert to base64 for Claude
        const base64Image = imageToBase64(processedBuffer);

        // Analyze with Claude
        const analysis = await analyzeFood(base64Image);

        // Upload to MinIO
        const fileName = `${userId}/${uuidv4()}.jpg`;
        await uploadImage(fileName, processedBuffer, 'image/jpeg');
        const imageUrl = getImageUrl(fileName);

        res.json({
            success: true,
            imageUrl,
            analysis: {
                foods: analysis.foods,
                totalCarbohydrates: analysis.totalCarbohydrates,
                confidence: analysis.confidence,
            },
        });
    } catch (error) {
        console.error('Error analyzing food:', error);
        res.status(500).json({
            error: 'Failed to analyze food image',
            message: error.message,
        });
    }
});

// Get analysis history (placeholder - would need database)
router.get('/history/:userId', async (req, res) => {
    try {
        // This would typically query a database
        // For now, return empty array
        res.json({
            success: true,
            history: [],
        });
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
});

module.exports = router;
