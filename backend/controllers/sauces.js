/** Import du schema Sauce */
const Sauce = require('../models/Sauce')
const fs = require('fs')


// Affichage de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => { res.status(200).json(sauces) })
        .catch(error => {
            res.status(400).json({ error })
        })
}

// Créer une sauce
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

// Afficher une sauce par son id
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
}



// Fonction pour modifier un objet de la requête Post /api/sauces/:id
exports.modifySauce = (req, res, next) => {

    // Si j'ai une image dans ma requête alors je la traite et je modifie la propriété imageUrl pour lui donner le chemin, sinon je recupère le body
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {
        ...req.body
    }


    delete sauceObject._userId

    // Je cherche la sauce dans la base de donnée
    Sauce.findOne({ _id: req.params.id })

        .then((sauce) => {

            // Je recupère uniquement le nom du fichier contenu dans l url
            const filename = sauce.imageUrl.split("/images/")[1]

            // Je verifie si l'utilisateur est celui a qui appartient la sauce
            if (sauce.userId === req.auth.userId) {

                // Je mets à jour mes données
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
                    .catch(error => res.status(400).json({ error }))
            }
            else {

                res.status(403).json({ message: 'Non autorisée ! ' })

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

// Supprime une sauce
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
        .catch((error) => res.status(404).json({ error }))
}

// Like ou Dislike une sauce
exports.likeSauce = (req, res, next) => {

    let like = req.body.like // Recupère le like de la requête, 0 ou 1 ou -1
    const userId = req.body.userId
    const sauceId = req.params.id

    // Traite chaque cas de valeur du like
    switch (like) {

        // Dans le cas ou le like est a 0 
        case 0:

            // trouve la sauce dans la base de donnée
            Sauce.findOne({ _id: sauceId })

                .then((sauce) => {

                    // si l'user est déjà dans le tableau des usersLiked, retire un like au compteur des likes avec ($inc) et supprime l'user du tableau des likes avec ($pull)
                    if (sauce.usersLiked.find(user => user === userId)) {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { likes: -1 },
                                $pull: { usersLiked: userId },
                                _id: sauceId
                            })

                            .then(() => res.status(204).json({ message: "Avis supprimé !" }))
                            .catch((error) => res.status(400).json({ error }))
                    }
                    // si l'user se trouve dans le tableau des userDisliked, retire un dislike du compteur des dislikes et retire l'user du tableau des dislikes
                    if (sauce.usersDisliked.find(user => user === userId)) {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { dislikes: -1 },
                                $pull: { usersDisliked: userId },
                                _id: sauceId
                            })

                            .then(() => res.status(204).json({ message: "Avis supprimé !" }))
                            .catch((error) => res.status(400).json({ error }))
                    }
                })
                .catch((error) => res.status(404).json({ error }))
            break

        // Dans le cas d'un like (1)
        case 1:
            // Si le like passe a 1, met a jour le nombre de like et ajoute l'id de l'user dans le tableau des usersLiked avec ($push)
            Sauce.updateOne({ _id: sauceId },
                {
                    $inc: { likes: 1 },
                    $push: { usersLiked: userId },
                    _id: sauceId
                })
                .then(() => res.status(204).json({ message: "Avis donné !" }))
                .catch((error) => res.status(400).json({ error }))

            break

        // Dans le cas d'un dislike (-1)
        case -1:
            //Si l'user met un dislike, alors on ajoute 1 au compteur des dislikes de la sauce et on stock l'id de l'user dans le tableau des usersDisliked     
            Sauce.updateOne({ _id: sauceId },
                {
                    $inc: { dislikes: 1 },
                    $push: { usersDisliked: userId },
                    _id: sauceId
                })
                .then(() => res.status(204).json({ message: "Avis negatif donné !" }))
                .catch((error) => res.status(400).json({ error }))

            break
        default:
            console.log(`il n y a pas de like`)
    }

}
