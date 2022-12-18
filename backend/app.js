/** Import des modules nécessaires */
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')



/** Initialisation de l'API  */
const app = express()

/** Import des routeurs */
const userRoutes = require('./routes/user')
const saucesRoutes = require('./routes/sauces')


/** Connnection à la BDD */
mongoose.connect(process.env.MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'))


/** Configuration de rateLimit */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})



/**  Creation du middleware rate limit pour les appels API*/
app.use('/api', apiLimiter)

/** Creation du middleware pour le cors */
app.use(cors())

// Utilisation d'helmet pour la sécurité
app.use(helmet({ crossOriginResourcePolicy: false }))

app.use(express.json())
app.use('/images', express.static(path.join(__dirname, 'images')))



/**  Routes */
app.use('/api/auth', userRoutes)
app.use('/api/sauces', saucesRoutes)

module.exports = app