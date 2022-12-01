/** Import du Schema user */
const User = require('../models/User')

/** Initialisation du package bcrypt pour le hachage du mot de pass */
const bcrypt = require('bcrypt')

/** Initialisation du package d'encodage du token */
const jwt = require('jsonwebtoken')

exports.signup = (req, res, next) => {

    bcrypt.hash(req.body.password, 10)
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

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })

        // Il faut verifier si l'utilisateur à ete trouvé, et si le mot de pass est le bon
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
                                    //Nous utilisons la fonction sign de jsonwebtoken pour chiffrer un nouveau token
                                    jwt.sign(
                                        { userId: user._id },
                                        process.env.TOKEN_JWT,
                                        { expiresIn: '24h' }
                                    )
                                //Ce token contient l'ID de l'utilisateur en tant que payload (les données encodées dans le token).
                                // Nous utilisons une chaîne secrète de développement temporaire RANDOM_SECRET_KEY pour crypter notre token - !! en vrai plus long et aleatoire pour la securite
                                // Une durée d'expiration du token
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