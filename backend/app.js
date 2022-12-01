//** Import des modules nécessaires */
const express = require('express')
const mongoose = require('mongoose')
const User = require('./models/User')
const dotenv = require('dotenv')
const cors = require('cors')
const path = require('path')
//** Initialisation de l'API  */

const app = express()


/** Import des routeurs */
const userRoutes = require('./routes/user')
const saucesRoutes = require('./routes/sauces')

dotenv.config()

//** Connnection à la BDD */
mongoose.connect(process.env.MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'))



//  Creation du middleware pour le cors, avant la route API // s'appliquera a toutes les routes

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    next()
})


//app.use(cors())
app.use(express.json())
app.use('/images', express.static(path.join(__dirname, 'images')))



// routes

app.use('/api/auth', userRoutes)
app.use('/api/sauces', saucesRoutes)




module.exports = app