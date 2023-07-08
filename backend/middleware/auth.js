const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        // Récupérer le token d'authentification à partir des en-têtes de la requête
        const token = req.headers.authorization.split(' ')[1]

        // Vérifier et décoder le token à l'aide de la clé secrète
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET)

        // Extraire l'ID utilisateur à partir du token décrypté
        const userId = decodedToken.userId

        // Ajouter l'ID utilisateur à l'objet "auth" attaché à la requête
        req.auth = {
            userId: userId,
        }

        // Passer au middleware suivant
        next()
    } catch (error) {
        // En cas d'erreur, renvoyer une réponse avec un code 401 (Non autorisé) et l'erreur
        res.status(401).json({ error })
    }
}
