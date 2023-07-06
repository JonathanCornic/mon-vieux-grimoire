const fs = require('fs')
const path = require('path')

// Fonction pour supprimer une image du système de fichiers
const deleteImage = (imageUrl) => {
    // Vérification si l'URL de l'image est définie
    if (!imageUrl) return

    // Extraction du nom de fichier à partir de l'URL de l'image
    const filename = imageUrl.split('/images/')[1]

    // Construction du chemin complet de l'image
    const imagePath = path.join(__dirname, '..', 'images', filename)

    // Suppression du fichier d'image
    fs.unlink(imagePath, (error) => {
        if (error) {
            console.error("Erreur lors de la suppression de l'image :", error)
        }
    })
}

module.exports = deleteImage
