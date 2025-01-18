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

                    this.canvasManager.images.push({
                        img,
                        x: centerX / this.canvasManager.scale,
                        y: centerY / this.canvasManager.scale,
                        width: newWidth,
                        height: newHeight,
                    })

                    this.canvasManager.redrawCanvas()
                }

                img.src = e.target.result
            }

            reader.readAsDataURL(file)
        })
    }
}

export default ImageUploader
