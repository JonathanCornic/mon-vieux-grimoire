const Book = require('../models/Book')
const deleteImage = require('../utils/deleteImage')

exports.createBook = async (req, res) => {
    try {
        // Convertir la chaîne JSON en objet JavaScript
        const bookObject = JSON.parse(req.body.book)
        // Supprimer les propriétés "_id" et "_userId" de l'objet du livre
        delete bookObject._id
        delete bookObject._userId

        // Créer une instance du modèle Book avec les données du livre
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId, // Utiliser l'ID de l'utilisateur extrait de l'authentification
            imageUrl: `${req.protocol}://${req.get('host')}/images/${
                req.file.filename
            }`,
        })

        // Sauvegarder le livre dans la base de données
        await book.save()

        // Envoyer une réponse avec un message de succès
        res.status(201).json({ message: 'Livre enregistré !' })
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse avec l'erreur
        res.status(400).json({ error })
    }
}

exports.createRating = async (req, res) => {
    try {
        // Extraire les données de la requête (ID utilisateur et note)
        const { userId, rating } = req.body
        // Trouver le livre correspondant à l'ID dans les paramètres de la requête
        const book = await Book.findById(req.params.id)

        // Vérifier si la requête contient une note
        if (!req.body) {
            return res
                .status(400)
                .json({ message: 'Votre requête ne contient aucune note !' })
        }

        // Vérifier si l'utilisateur a déjà noté ce livre
        if (book.ratings.some((rating) => rating.userId === userId)) {
            return res
                .status(400)
                .json({ message: 'Vous avez déjà noté ce livre !' })
        }

        // Ajouter la note à la liste des notes du livre et calculer la moyenne
        book.ratings.push({ userId: userId, grade: rating })
        const grades = book.ratings.map((rating) => rating.grade)
        const average =
            grades.reduce((total, grade) => total + grade, 0) / grades.length
        book.averageRating = parseFloat(average.toFixed(1))
        await book.save()

        // Envoyer une réponse avec le livre mis à jour
        res.status(200).json(book)
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse avec l'erreur
        console.error(error)
        res.status(500).json({ error })
    }
}

exports.modifyBook = async (req, res) => {
    try {
        // Extraire l'ID du livre des paramètres de la requête
        const { id } = req.params
        // Trouver le livre correspondant à l'ID
        const book = await Book.findOne({ _id: id })

        // Vérifier si le livre existe
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé !' })
        }

        // Vérifier si l'utilisateur a le droit de modifier le livre (vérification de l'ID utilisateur)
        if (book.userId != req.auth.userId) {
            return res
                .status(401)
                .json({ message: "Vous n'êtes pas autorisé !" })
        }

        // Préparer les données du livre à mettre à jour
        const bookData = req.file
            ? {
                  ...JSON.parse(req.body.book),
                  imageUrl: `${req.protocol}://${req.get('host')}/images/${
                      req.file.filename
                  }`,
              }
            : { ...req.body }

        // Supprimer l'ancienne image du livre si une nouvelle image est envoyée
        if (req.file && book.imageUrl) {
            deleteImage(book.imageUrl)
        }

        // Supprimer les propriétés "_id" et "_userId" du nouvel objet de livre
        delete bookData._id
        delete bookData._userId

        // Mettre à jour le livre dans la base de données
        await Book.updateOne({ _id: id }, { ...bookData })

        // Envoyer une réponse avec un message de succès
        res.status(200).json({ message: 'Livre modifié avec succès !' })
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse avec l'erreur
        res.status(500).json({ error })
    }
}

exports.deleteBook = async (req, res) => {
    try {
        // Extraire l'ID du livre des paramètres de la requête
        const { id } = req.params
        // Trouver et supprimer le livre correspondant à l'ID et à l'ID utilisateur
        const book = await Book.findOneAndDelete({
            _id: id,
            userId: req.auth.userId,
        })

        // Vérifier si le livre a été trouvé
        if (!book) {
            return res.status(401).json({ message: 'Livre non trouvé !' })
        }

        // Supprimer l'image du livre si elle existe
        if (book.imageUrl) {
            deleteImage(book.imageUrl)
        }

        // Envoyer une réponse avec un message de succès
        res.status(200).json({ message: 'Objet supprimé !' })
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse avec l'erreur
        res.status(500).json({ error })
    }
}

exports.getOneBook = async (req, res) => {
    try {
        // Trouver le livre correspondant à l'ID dans les paramètres de la requête
        const book = await Book.findOne({ _id: req.params.id })

        // Vérifier si le livre a été trouvé
        if (!book) {
            return res.status(404).json({ error: 'Livre non trouvé !' })
        }

        // Envoyer une réponse avec le livre
        res.status(200).json(book)
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse avec l'erreur
        res.status(500).json({ error })
    }
}

exports.getBestBooks = async (req, res) => {
    try {
        // Utiliser l'agrégation MongoDB pour projeter les champs souhaités et calculer la moyenne des notes
        const books = await Book.aggregate([
            {
                $project: {
                    title: 1,
                    imageUrl: 1,
                    author: 1,
                    year: 1,
                    genre: 1,
                    averageRating: { $avg: '$ratings.grade' },
                },
            },
            {
                $sort: { averageRating: -1 },
            },
            {
                $limit: 3,
            },
        ])

        // Envoyer une réponse avec les meilleurs livres
        res.status(200).json(books)
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse avec l'erreur
        res.status(400).json({ error })
    }
}

exports.getAllBooks = async (req, res) => {
    try {
        // Obtenir tous les livres à partir de la base de données
        const books = await Book.find()

        // Envoyer une réponse avec tous les livres
        res.status(200).json(books)
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse avec l'erreur
        res.status(400).json({ error })
    }
}
