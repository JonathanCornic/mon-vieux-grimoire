const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const { upload, resizeImage } = require('../middleware/multerAndSharp')

const bookCtrl = require('../controllers/book')

router.post('/', auth, upload, resizeImage, bookCtrl.createBook)
router.post('/:id/rating', auth, bookCtrl.createRating)
router.put('/:id', auth, upload, resizeImage, bookCtrl.modifyBook)
router.delete('/:id', auth, bookCtrl.deleteBook)
router.get('/bestrating', bookCtrl.getBestBooks)
router.get('/:id', bookCtrl.getOneBook)
router.get('/', bookCtrl.getAllBooks)

module.exports = router
