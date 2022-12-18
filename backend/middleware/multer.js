/** Import de multer package de gestion de fichiers */
const multer = require('multer')

// Defini les extensions autorisées en upload
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png'
}

// On indique à multer un fichier de destination pour stocker les images
// On renomme les images en supprimant les espaces s'il y en avait en les remplacant par un "_ " et en y ajoutant la date du jour et on y rajoute l'extension
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