const Book = require('../models/Book')
const deleteImage = require('../utils/deleteImage')

exports.createBook = async (req, res) => {
    try {
        const bookObject = JSON.parse(req.body.book)
        delete bookObject._id
        delete bookObject._userId

        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${
                req.file.filename
            }`,
        })

        await book.save()

        res.status(201).json({ message: 'Livre enregistré !' })
    } catch (error) {
        res.status(400).json({ error })
    }
}

exports.createRating = async (req, res) => {
    try {
        const { userId, rating } = req.body
        const book = await Book.findById(req.params.id)

        if (!req.body) {
            return res
                .status(400)
                .json({ message: 'Votre requête ne contient aucune note !' })
        }

        if (book.ratings.some((rating) => rating.userId === userId)) {
            return res
                .status(400)
                .json({ message: 'Vous avez déjà noté ce livre !' })
        }

        book.ratings.push({ userId: userId, grade: rating })
        const grades = book.ratings.map((rating) => rating.grade)
        const average =
            grades.reduce((total, grade) => total + grade, 0) / grades.length
        book.averageRating = parseFloat(average.toFixed(1))
        await book.save()

        res.status(200).json(book)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error })
    }
}

exports.modifyBook = async (req, res) => {
    try {
        const { id } = req.params
        const book = await Book.findOne({ _id: id })

        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé !' })
        }

        if (book.userId != req.auth.userId) {
            return res
                .status(401)
                .json({ message: "Vous n'êtes pas autorisé !" })
        }

        const bookData = req.file
            ? {
                  ...JSON.parse(req.body.book),
                  imageUrl: `${req.protocol}://${req.get('host')}/images/${
                      req.file.filename
                  }`,
              }
            : { ...req.body }

        if (req.file && book.imageUrl) {
            deleteImage(book.imageUrl)
        }

        delete bookData._id
        delete bookData._userId

        await Book.updateOne({ _id: id }, { ...bookData })

        res.status(200).json({ message: 'Livre modifié avec succès !' })
    } catch (error) {
        res.status(500).json({ error })
    }
}

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params
        const book = await Book.findOneAndDelete({
            _id: id,
            userId: req.auth.userId,
        })

        if (!book) {
            return res.status(401).json({ message: 'Livre non trouvé !' })
        }

        if (book.imageUrl) {
            deleteImage(book.imageUrl)
        }

        res.status(200).json({ message: 'Objet supprimé !' })
    } catch (error) {
        res.status(500).json({ error })
    }
}

exports.getOneBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id })

        if (!book) {
            return res.status(404).json({ error: 'Livre non trouvé !' })
        }

        res.status(200).json(book)
    } catch (error) {
        res.status(500).json({ error })
    }
}

exports.getBestBooks = async (req, res) => {
    try {
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

        res.status(200).json(books)
    } catch (error) {
        res.status(400).json({ error })
    }
}

exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find()
        res.status(200).json(books)
    } catch (error) {
        res.status(400).json({ error })
    }
}
