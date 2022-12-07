/** Import du Schema user */
const User = require('../models/User')

/** Initialisation du package bcrypt pour le hachage du mot de passe */
const bcrypt = require('bcrypt')

/** Initialisation du package d'encodage du token */
const jwt = require('jsonwebtoken')

/** Création des methodes de création de compte + login */

// Fonction pour créer un nouvel utilisateur
exports.signup = (req, res, next) => {

    // Hachage du mot de passe avec bcrypt , variable salt en environnement pour plus de sécurité
    bcrypt.hash(req.body.password, parseInt(process.env.SALT_NUMB))


        .then(hash => {

            const user = new User({
                email: req.body.email,
                password: hash
            })
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}

// Fonction pour connecter un utilisateur
exports.login = (req, res, next) => {

    // Il faut verifier si l'utilisateur à ete trouvé, et si le mot de passe est le bon
    User.findOne({ email: req.body.email })

        .then(user => {
            if (user === null) {
                res.status(401).json({ message: 'Paire identifiant/mot de passe incorrect' })
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json({ message: 'Paire identifiant/mot de passe incorrect' })
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token:
                                    // Nous utilisons la fonction sign de jsonwebtoken pour chiffrer un nouveau token
                                    jwt.sign(
                                        { userId: user._id },
                                        process.env.TOKEN_JWT,
                                        { expiresIn: '24h' }
                                    )

                            })
                        }
                    })
                    .catch(error => {
                        res.status(500).json({ error })
                    })
            }
        })

        .catch(error => {
            res.status(500).json({ error })
        })

}