const Book = require('../models/Book')

exports.createBook = (req, res) => {
    const book = new Book({ ...req.body })
    book.save()
        .then(() =>
            res.status(201).json({ message: 'Post saved successfully!' })
        )
        .catch((error) => res.status(400).json({ error }))
}

exports.modifyBook = (req, res) => {
    Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch((error) => res.status(400).json({ error }))
}

exports.deleteBook = (req, res) => {
    Book.deleteOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(404).json({ error }))
}

exports.getOneBook = (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(404).json({ error }))
}

exports.getBestBooks = (req, res) => {
    Book.aggregate([
        {
            $group: {
                _id: '$_id',
                title: { $first: '$title' },
                averageRating: { $avg: '$rating' },
            },
        },
        {
            $sort: { averageRating: -1 },
        },
        {
            $limit: 3,
        },
    ])
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }))
}

exports.getAllBooks = (req, res) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }))
}
