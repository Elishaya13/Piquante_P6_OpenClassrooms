/** Import des modules nécessaires */
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const helmet = require('helmet')



/** Initialisation de l'API  */
const app = express()

/** Import des routeurs */
const userRoutes = require('./routes/user')
const saucesRoutes = require('./routes/sauces')


//** Connnection à la BDD */
mongoose.connect(process.env.MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'))



/** Creation du middleware pour le cors */
app.use(cors())

// Utilisation d'helmet pour la sécurité
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(express.json())
app.use('/images', express.static(path.join(__dirname, 'images')))



// Routes
app.use('/api/auth', userRoutes)
app.use('/api/sauces', saucesRoutes)




module.exports = app