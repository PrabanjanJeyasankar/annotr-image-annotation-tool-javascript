class ImageWithAnnotations {
    constructor(img, x, y, width, height) {
        this.img = img
        this.id = Math.random().toString(36).substr(2, 9)
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.annotations = []
        this.base64Data = img.dataset.base64
    }

    addAnnotation(annotation) {
        this.annotations.push(annotation)
    }

    removeAnnotation(annotationId) {
        this.annotations = this.annotations.filter((a) => a.id !== annotationId)
    }

    moveBy(deltaX, deltaY) {
        this.x += deltaX
        this.y += deltaY

        this.annotations.forEach((annotation) => {
            annotation.position.x += deltaX
            annotation.position.y += deltaY
        })
    }
}

export default ImageWithAnnotations
