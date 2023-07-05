const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const user = new User({
            email: req.body.email,
            password: hashedPassword,
        })

        await user.save()

        res.status(201).json({ message: 'Utilisateur créé !' })
    } catch (error) {
        res.status(500).json({ error })
    }
}

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        if (!user) {
            return res.status(401).json({
                message: 'Paire login/mot de passe incorrecte',
            })
        }

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        )

        if (!validPassword) {
            return res.status(401).json({
                message: 'Paire login/mot de passe incorrecte',
            })
        }

        res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, 'RANDOM_TOKEN_SECRET', {
                expiresIn: '24h',
            }),
        })
    } catch (error) {
        res.status(500).json({ error })
    }
}
