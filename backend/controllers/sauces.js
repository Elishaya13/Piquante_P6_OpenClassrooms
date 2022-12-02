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
        .then(() => { res.status(201).json({ message: "Sauce enregistrée !" }) })
        .catch(error => { res.status(400).json({ error }) })
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
                    .catch(error => res.status(403).json({ error }))
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

exports.likeSauce = (req, res, next) => {
    let like = req.body.like
    const userId = req.body.userId
    const sauceId = req.params.id

    switch (like) {

        // Dans le cas ou le like est a 0 
        case 0:
            Sauce.findOne({ _id: sauceId })
                .then((sauce) => {

                    // si l'utilisateur est dans le tableau des usersLiked, retire un like a la sauce et supprime l'utilisateur du tableau des likes de la sauce ($pull)
                    if (sauce.usersLiked.find(user => user === userId)) {
                        Sauce.updateOne({ _id: sauceId }, { $inc: { likes: -1 }, $pull: { usersLiked: userId }, _id: sauceId })

                            .then(() => res.status(200).json({ message: "Avis supprimé !" }))
                            .catch((error) => res.status(400).json({ error }))
                    }
                    // si l'utilisateur se trouve dans le tableau des userDisliked, retire un dislike du tableau des dislikes
                    if (sauce.usersDisliked.find(user => user === userId)) {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { dislikes: -1 },
                                $pull: { usersDisliked: userId },
                                _id: sauceId
                            })

                            .then(() => res.status(200).json({ message: "Avis supprimé !" }))
                            .catch((error) => res.status(400).json({ error }))
                    }
                })
                .catch((error) => res.status(400).json({ error }))
            break

        // Si le like passe a 1, recupere la sauce de ma DB et met a jour le nombre de like sur la sauce, verifie si l'utilsateur n'a pas deja like
        case 1:

            Sauce.findOne({ _id: sauceId })
                .then((sauce) => {
                    if (sauce.usersLiked.find(user => user === userId)) {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { likes: -1 },
                                $pull: { usersLiked: userId },
                                _id: sauceId
                            })

                            .then(() => res.status(200).json({ message: "Avis supprimé !" }))
                            .catch((error) => res.status(400).json({ error }))
                    } else {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { likes: 1 },
                                $push: { usersLiked: userId },
                                _id: sauceId
                            })
                            .then(() => res.status(200).json({ message: "Avis donné !" }))
                            .catch((error) => res.status(400).json({ error }))
                    }
                })
                .catch((error) => res.status(400).json({ error }))

            break
        // Si l'utilisateur clic sur l'avis negatif, alors on ajoute un dislike 
        // si l'utilisateur avait deja donné un avis negatif, retire la valeur du dislike  et supprime l'utilisateur du tableau des disliked 
        case -1:
            Sauce.findOne({ _id: sauceId })
                .then((sauce) => {
                    if (sauce.usersDisliked.find(user => user === userId)) {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { dislikes: -1 },
                                $pull: { usersDisliked: userId },
                                _id: sauceId
                            })

                            .then(() => res.status(200).json({ message: "Avis negatif supprimé !" }))
                            .catch((error) => res.status(400).json({ error }))
                    } else {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { dislikes: 1 },
                                $push: { usersDisliked: userId },
                                _id: sauceId
                            })
                            .then(() => res.status(200).json({ message: "Avis negatif donné !" }))
                            .catch((error) => res.status(400).json({ error }))
                    }
                })
                .catch((error) => res.status(400).json({ error }))
            break
        default:
            console.log(`il n y a pas de ${like}`)
    }

}
