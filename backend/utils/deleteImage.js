const fs = require('fs')
const path = require('path')
const deleteImage = (imageUrl) => {
    if (!imageUrl) return

    const filename = imageUrl.split('/images/')[1]
    const imagePath = path.join(__dirname, '..', 'images', filename)
    fs.unlink(imagePath, (error) => {
        if (error) {
            console.error("erreur dans la suppression de l'image:", error)
        }
    })
}

module.exports = deleteImage