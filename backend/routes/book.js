const express = require('express')
const router = express.Router()

const Book = require('../models/Book')

// router.post('/', (req, res, next) => {
//     const book = new Book({
//         ...req.body,
//     })
//     book.save()
//         .then(() => {
//             res.status(201).json({
//                 message: 'Post saved successfully!',
//             })
//         })
//         .catch((error) => {
//             res.status(400).json({ error })
//         })
//     next()
// })

// router.get('/:id', (req, res, next) => {
//     Book.findOne({
//         _id: req.params.id,
//     })
//         .then((book) => {
//             res.status(200).json(book)
//         })
//         .catch((error) => {
//             res.status(404).json({ error })
//         })
//     next()
// })

// router.get('/bestrating', (req, res, next) => {})

// router.get('/' + '', (req, res) => {
//     Book.find()
//         .then((books) => {
//             res.status(200).json(books)
//         })
//         .catch((error) => {
//             res.status(400).json({ error })
//         })
// })

module.exports = router
