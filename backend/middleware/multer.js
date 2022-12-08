/** Import de multer package de gestion de fichiers */
const multer = require('multer')

// Defini les extensions autorisées en upload
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png'
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },

    filename: (req, file, callback) => {

        const extension = MIME_TYPES[file.mimetype]
        let name = file.originalname.split(' ').join('_')
        name = name.split("." + extension)[0]
        callback(null, name + '_' + Date.now() + "." + extension)

    }
})
module.exports = multer({ storage: storage }).single('image')