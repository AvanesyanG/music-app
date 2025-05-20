import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: fileFilter
});

// Middleware for single file upload
export const uploadSingleMiddleware = (fieldName) => {
    return (req, res, next) => {
        console.log('=== MULTER MIDDLEWARE ===');
        console.log('Original body:', req.body);
        
        const uploadMiddleware = upload.single(fieldName);
        
        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                console.error('Multer error:', err);
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`
                });
            } else if (err) {
                console.error('Unknown error:', err);
                return res.status(500).json({
                    success: false,
                    message: `Server error: ${err.message}`
                });
            }
            
            // Log the processed request
            console.log('Processed body:', req.body);
            console.log('Processed file:', req.file);
            
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
};

// Middleware for multiple file uploads
export const uploadFieldsMiddleware = (fields) => {
    return (req, res, next) => {
        console.log('=== MULTER FIELDS MIDDLEWARE ===');
        console.log('Original body:', req.body);
        
        const uploadMiddleware = upload.fields(fields);
        
        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                console.error('Multer error:', err);
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`
                });
            } else if (err) {
                console.error('Unknown error:', err);
                return res.status(500).json({
                    success: false,
                    message: `Server error: ${err.message}`
                });
            }
            
            // Log the processed request
            console.log('Processed body:', req.body);
            console.log('Processed files:', req.files);
            
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
};