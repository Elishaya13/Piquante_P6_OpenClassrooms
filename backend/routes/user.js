/** Import des modules nécessaires */
const express = require('express')
const router = express.Router()

// Import des fonctions pour les utilisateurs
const userCtrl = require('../controllers/user')

/** Définition des routes */
router.post('/signup', userCtrl.signup)
router.post('/login', userCtrl.login)

module.exports = router