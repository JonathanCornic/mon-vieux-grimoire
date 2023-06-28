const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

const bookCtrl = require('../controllers/book')

router.post('/', auth, multer, bookCtrl.createBook)
router.put('/:id', bookCtrl.modifyBook)
router.delete('/:id', bookCtrl.deleteBook)
router.get('/:id', bookCtrl.getOneBook)
router.get('/bestrating', bookCtrl.getBestBooks)
router.get('/', bookCtrl.getAllBooks)

module.exports = router
