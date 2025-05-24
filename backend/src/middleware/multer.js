import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create this directory first
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueName + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: function (req, file, cb) {
        // Accept images and audio files
        if (file.fieldname === 'image') {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Only image files are allowed!'), false);
            }
        } else if (file.fieldname === 'file') {
            if (!file.originalname.match(/\.(mp3|wav|ogg|m4a)$/)) {
                return cb(new Error('Only audio files are allowed!'), false);
            }
        }
        cb(null, true);
    }
});

// Create middleware for single file upload (for albums)
export const uploadMiddleware = (req, res, next) => {
    upload.single('image')(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            return res.status(500).json({
                success: false,
                message: `Unknown error: ${err.message}`
            });
        }

        // Log the request body after multer processes it
        console.log('Request body after multer:', req.body);
        
        // Ensure all form fields are properly parsed
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (req.body[key] === 'undefined' || req.body[key] === 'null') {
                    req.body[key] = undefined;
                }
            });
        }

        next();
    });
};

// Create middleware for multiple file uploads (for songs)
export const uploadFieldsMiddleware = (req, res, next) => {
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 }
    ])(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            return res.status(500).json({
                success: false,
                message: `Unknown error: ${err.message}`
            });
        }

        // Log the request body after multer processes it
        console.log('Request body after multer:', req.body);
        
        // Ensure all form fields are properly parsed
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (req.body[key] === 'undefined' || req.body[key] === 'null') {
                    req.body[key] = undefined;
                }
            });
        }

        next();
    });
};