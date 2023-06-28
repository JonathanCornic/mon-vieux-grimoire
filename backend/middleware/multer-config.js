const multer = require('multer')

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_')
        const extension = MIME_TYPES[file.mimetype]
        callback(null, name + '_' + Date.now() + '.' + extension)
    },
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (MIME_TYPES[file.mimetype]) {
            callback(null, true)
        } else {
            callback(new Error('Invalid file type'))
        }
    },
})

module.exports = upload.single('image')
