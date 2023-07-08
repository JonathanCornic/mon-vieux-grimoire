const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res) => {
    try {
        // Hasher le mot de passe fourni
        let hashedPassword = null
        if (req.body.password === '') {
            return res.status(400).json({
                message: 'Mot de passe requis !',
            })
        } else {
            hashedPassword = await bcrypt.hash(req.body.password, 10)
        }
        // Trouver l'utilisateur correspondant à l'email fourni
        const findUser = await User.findOne({ email: req.body.email })

        // Vérifier si l'utilisateur existe
        if (findUser) {
            return res.status(409).json({
                message: 'Mail deja utilisé !',
            })
        }
        // Créer un nouvel utilisateur avec l'email et le mot de passe hashé
        const user = new User({
            email: req.body.email,
            password: hashedPassword,
        })

        // Sauvegarder l'utilisateur dans la base de données
        await user.save()

        // Envoyer une réponse avec un code 201 (Créé) et un message de succès
        res.status(201).json({ message: 'Utilisateur créé !' })
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse avec l'erreur
        res.status(500).json({ error })
    }
}

exports.login = async (req, res) => {
    try {
        // Trouver l'utilisateur correspondant à l'email fourni
        const user = await User.findOne({ email: req.body.email })

        // Vérifier si l'utilisateur existe
        if (!user) {
            return res.status(401).json({
                message: 'Paire login/mot de passe incorrecte',
            })
        }

        // Vérifier si le mot de passe fourni correspond au mot de passe hashé de l'utilisateur
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        )

        // Si le mot de passe est incorrect, renvoyer une réponse avec un code 401 (Non autorisé) et un message d'erreur
        if (!validPassword) {
            return res.status(401).json({
                message: 'Paire login/mot de passe incorrecte',
            })
        }

        // Si l'authentification réussit, générer un token JWT pour l'utilisateur
        const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
            expiresIn: '24h',
        })

        // Envoyer une réponse avec un code 200 (OK), l'ID utilisateur et le token JWT
        res.status(200).json({
            userId: user._id,
            token: token,
        })
    } catch (error) {
        // Gérer les erreurs et renvoyer une réponse avec l'erreur
        res.status(500).json({ error })
    }
}
