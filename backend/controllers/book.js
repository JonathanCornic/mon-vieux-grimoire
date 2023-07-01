const Book = require('../models/Book')
const fs = require('fs')
const path = require('path');

exports.createBook = (req, res) => {
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

    book.save()
        .then(() => {
            res.status(201).json({ message: 'Objet enregistré !' })
        })
        .catch((error) => {
            res.status(400).json({ error })
        })
}

exports.createRating = async (req, res) => {
    try {
        const { userId, rating } = req.body;
        const { id } = req.params;

        if (rating < 0 || rating > 5) {
            return res
                .status(400)
                .json({ message: 'Rating should be between 0 and 5' });
        }

        const book = await Book.findByIdAndUpdate(
            id,
            {
                $push: { ratings: { userId, grade: rating } },
            },
            { new: true }
        );

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const totalRatings = book.ratings.length;
        const sumRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
        const averageRating = sumRatings / totalRatings;

        book.averageRating = averageRating;

        await book.save();

        res.status(200).json({ message: 'Rating set successfully', book: { ...book.toObject(), id: book._id } });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};


const deleteImage = (imageUrl) => {
    if (!imageUrl) return

    const filename = imageUrl.split('/images/')[1]
    const imagePath = path.join(__dirname, '..', 'images', filename)
    fs.unlink(imagePath, (error) => {
        if (error) {
            console.error('Error deleting image file:', error)
        }
    })
}

exports.modifyBook = async (req, res) => {
    try {
        const { id } = req.params
        const book = await Book.findOne({ _id: id })

        if (!book) {
            return res.status(404).json({ message: 'Book not found' })
        }

        if (book.userId != req.auth.userId) {
            return res.status(401).json({ message: 'Not authorized' })
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

        res.status(200).json({ message: 'Book modified successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' })
            } else {
                if (book.imageUrl) {
                    deleteImage(book.imageUrl)
                }

                Book.deleteOne({ _id: req.params.id })
                    .then(() => {
                        res.status(200).json({ message: 'Objet supprimé !' })
                    })
                    .catch((error) => res.status(401).json({ error }))
            }
        })
        .catch((error) => {
            res.status(500).json({ error })
        })
}

exports.getOneBook = (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(404).json({ error }))
}

exports.getBestBooks = (req, res) => {
    Book.aggregate([
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
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }))
}

exports.getAllBooks = (req, res) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }))
}
