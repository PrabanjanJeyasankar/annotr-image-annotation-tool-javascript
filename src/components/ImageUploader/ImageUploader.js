import ImageWithAnnotations from '../../components/Annotation/ImageWithAnnotation.js'

class ImageUploader {
    constructor(fileInput, canvasManager) {
        this.fileInput = fileInput
        this.canvasManager = canvasManager

        this.fileInput.addEventListener(
            'change',
            this.handleFileUpload.bind(this)
        )
    }

    handleFileUpload(event) {
        const files = Array.from(event.target.files)

        files.forEach((file) => {
            const reader = new FileReader()

            reader.onload = (e) => {
                const base64Data = e.target.result
                const img = new Image()

                img.onload = () => {
                    if (!this.canvasManager.canvas) {
                        console.error('Canvas element is not available')
                        return
                    }

                    const maxWidth = 400
                    const maxHeight = 300
                    let newWidth = img.width
                    let newHeight = img.height

                    if (newWidth > maxWidth) {
                        newHeight = (maxWidth * newHeight) / newWidth
                        newWidth = maxWidth
                    }
                    if (newHeight > maxHeight) {
                        newWidth = (maxHeight * newWidth) / newHeight
                        newHeight = maxHeight
                    }

                    const centerX =
                        this.canvasManager.canvas.width / 2 - newWidth / 2
                    const centerY =
                        this.canvasManager.canvas.height / 2 - newHeight / 2

                    img.dataset.base64 = base64Data

                    const imageWithAnnotations = new ImageWithAnnotations(
                        img,
                        centerX / this.canvasManager.scale,
                        centerY / this.canvasManager.scale,
                        newWidth,
                        newHeight
                    )

                    this.canvasManager.images.push(imageWithAnnotations)
                    this.canvasManager.redrawCanvas()

                    const uploadEvent = new CustomEvent('imageUploaded', {
                        detail: {
                            imageId: imageWithAnnotations.id,
                            base64: base64Data,
                        },
                    })
                    window.dispatchEvent(uploadEvent)
                }

                img.src = base64Data
            }

            reader.readAsDataURL(file) 
        })
    }
    getImageBase64(imageId) {
        const image = this.canvasManager.images.find(
            (img) => img.id === imageId
        )
        return image ? image.base64Data : null
    }
}

export default ImageUploader
