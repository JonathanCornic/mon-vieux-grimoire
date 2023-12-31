const multer = require('multer')
const sharp = require('sharp')
const path = require('path')

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
}

// Configuration du stockage pour les fichiers téléchargés
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

// Configuration de l'upload des fichiers avec multer
const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (MIME_TYPES[file.mimetype]) {
            callback(null, true)
        } else {
            callback(new Error('Type de fichier invalide !'))
        }
    },
}).single('image')

// Middleware pour le redimensionnement d'images avec Sharp
const resizeImage = (req, res, next) => {
    if (!req.file) {
        return next()
    }

    const filePath = req.file.path

    sharp(filePath)
        .resize({ width: 160, height: 260 })
        .toBuffer()
        .then((data) => {
            sharp(data)
                .toFile(filePath)
                .then(() => {
                    next()
                })
                .catch((error) => {
                    next(error)
                })
        })
}

module.exports = {
    upload,
    resizeImage,
}
