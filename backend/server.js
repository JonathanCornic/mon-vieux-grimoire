const http = require('http')
const app = require('./app')

// Fonction pour normaliser le port d'écoute du serveur
const normalizePort = (val) => {
    const port = parseInt(val, 10)

    if (isNaN(port)) {
        return val
    }
    if (port >= 0) {
        return port
    }
    return false
}

// Normalisation du port d'écoute en utilisant la valeur de l'environnement
const port = normalizePort(process.env.PORT)
app.set('port', port)

// Gestionnaire d'erreurs du serveur
const errorHandler = (error) => {
    if (error.syscall !== 'listen') {
        throw error
    }
    const address = server.address()
    const bind =
        typeof address === 'string' ? 'pipe ' + address : 'port ' + port
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.')
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.')
            process.exit(1)
            break
        default:
            throw error
    }
}

// Création du serveur HTTP en utilisant l'application Express
const server = http.createServer(app)

// Gestion des événements d'erreur et d'écoute du serveur
server.on('error', errorHandler)
server.on('listening', () => {
    const address = server.address()
    const bind =
        typeof address === 'string' ? 'pipe ' + address : 'port ' + port
    console.log('Listening on ' + bind)
})

// Écoute du port spécifié
server.listen(port)
