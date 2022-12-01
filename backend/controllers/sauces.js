/** Import du schema Sauce */
const Sauce = require('../models/Sauce')
const fs = require('fs')


exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => { res.status(200).json(sauces) })
        .catch(error => {
            res.status(400).json({ error })
        })
}

exports.createSauce = (req, res, next) => {

    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id
    delete sauceObject._userId
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersDisliked: [],
        usersLiked: [],
    })
    sauce.save()
        .then(() => { res.status(201).json({ message: "Sauce enregristrée !" }) })
        .catch(error => { res.satus(400).json({ error }) })
}


exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
}




exports.modifySauce = (req, res, next) => {

    // Si j'ai une image je modifie la propieté imageUrl pour lui donner le chemin, sinon je recupère le body
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {
        ...req.body
    }

    delete sauceObject._userId

    // Je mets à jour mes données
    Sauce.findOne({ _id: req.params.id })

        .then((sauce) => {
            const filename = sauce.imageUrl.split("/images/")[1]

            if (sauce.userId === req.auth.userId) {

                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
                    .catch(error => res.status(401).json({ error }))
            }
            else {

                res.status(401).json({ message: 'Non autorisée ! ' })

            }

            // Je supprime l'ancien fichier si besoin
            if (req.file) {
                fs.unlink(`images/${filename}`, (err) => {
                    if (err) throw err;
                    console.log(`images/${filename} was deleted`)
                })
            }
        })
        .catch(error => { res.status(400).json({ error }) })
}


exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            const filename = sauce.imageUrl.split("/images/")[1]
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
                    .catch((error) => res.status(400).json({ error }))
            });
        })
        .catch((error) => res.status(500).json({ error }))
}