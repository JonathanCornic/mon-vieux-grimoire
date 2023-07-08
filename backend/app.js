require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bookRoutes = require('./routes/book')
const userRoutes = require('./routes/user')
const path = require('path')

// Connexion à la base de données MongoDB
mongoose
    .connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'))

//Permet d'utiliser app.use
const app = express()

// Utilisation du middleware pour traiter les données au format JSON (body-parser)
app.use(express.json())

// Configuration des en-têtes CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    )
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    )
    next()
})

// Routes pour les livres et les utilisateurs
app.use('/api/books', bookRoutes)
app.use('/api/auth', userRoutes)

// Configuration du serveur d'images statiques
app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app
