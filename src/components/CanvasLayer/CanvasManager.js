class CanvasManager {
    constructor(canvasElement, scrollBackButton) {
        this.canvas = canvasElement
        this.scrollBackButton = scrollBackButton
        this.ctx = this.canvas.getContext('2d')
        this.viewportOffset = { x: 0, y: 0 }
        this.scale = 1
        this.images = []
        this.isDragging = false
        this.isImageDragging = false
        this.selectedImage = null
        this.startDragOffset = { x: 0, y: 0 }

        this.activeTool = 'arrow'
        this.setActiveTool('arrow')

        this.canvas.addEventListener('wheel', this.onWheel.bind(this))
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this))

        this.checkButtonVisibility()
    }

    setActiveTool(tool) {
        this.activeTool = tool
        this.updateCursor()
    }

    updateCursor() {
        if (this.isDragging && this.activeTool === 'hand') {
            this.canvas.style.cursor = 'grabbing'
        } else {
            switch (this.activeTool) {
                case 'arrow':
                    this.canvas.style.cursor = 'default'
                    break
                case 'hand':
                    this.canvas.style.cursor = 'grab'
                    break
                default:
                    this.canvas.style.cursor = 'default'
            }
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.redrawCanvas()
        this.checkButtonVisibility()
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.createGrid()
        this.drawImages()
    }

    createGrid() {
        const gridSize = 30 * this.scale
        const offsetX = this.viewportOffset.x % gridSize
        const offsetY = this.viewportOffset.y % gridSize
        const gridColor = getComputedStyle(
            document.documentElement
        ).getPropertyValue('--color-secondary-gray')

        this.ctx.fillStyle = gridColor

        for (let x = offsetX; x < this.canvas.width; x += gridSize) {
            for (let y = offsetY; y < this.canvas.height; y += gridSize) {
                this.ctx.beginPath()
                this.ctx.arc(x, y, 1, 0, Math.PI * 2)
                this.ctx.fill()
            }
        }
    }

    drawImages() {
        this.ctx.save()
        this.ctx.scale(this.scale, this.scale)

        if (this.images && Array.isArray(this.images)) {
            this.images.forEach((image) => {
                this.ctx.drawImage(
                    image.img,
                    image.x + this.viewportOffset.x / this.scale,
                    image.y + this.viewportOffset.y / this.scale,
                    image.width,
                    image.height
                )
            })
        }

        this.ctx.restore()
    }

    onWheel(e) {
        if (e.ctrlKey) {
            e.preventDefault()
            e.stopPropagation()
            const mouseX = e.clientX
            const mouseY = e.clientY
            const zoomCenterX = (mouseX - this.viewportOffset.x) / this.scale
            const zoomCenterY = (mouseY - this.viewportOffset.y) / this.scale
            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
            const newScale = this.scale * zoomFactor

            if (newScale > 0.3 && newScale < 5) {
                this.scale = newScale
                this.viewportOffset.x = mouseX - zoomCenterX * this.scale
                this.viewportOffset.y = mouseY - zoomCenterY * this.scale
                this.redrawCanvas()
            }
        } else if (e.shiftKey) {
            e.preventDefault()
            this.viewportOffset.x -= e.deltaY
            this.redrawCanvas()
        } else {
            e.preventDefault()
            this.viewportOffset.y -= e.deltaY
            this.redrawCanvas()
        }

        this.checkButtonVisibility()
    }

    onMouseMove(e) {
        if (this.currentTool === 'arrow') {
            return
        }

        if (this.isImageDragging && this.selectedImage) {
            this.selectedImage.x =
                (e.clientX - this.startDragOffset.x - this.viewportOffset.x) /
                this.scale
            this.selectedImage.y =
                (e.clientY - this.startDragOffset.y - this.viewportOffset.y) /
                this.scale

            requestAnimationFrame(this.redrawCanvas.bind(this))
        } else if (this.isDragging) {
            this.viewportOffset.x = e.clientX - this.startDragOffset.x
            this.viewportOffset.y = e.clientY - this.startDragOffset.y
            requestAnimationFrame(this.redrawCanvas.bind(this))
        }

        this.checkButtonVisibility()
    }

    onMouseDown(e) {
        if (this.currentTool === 'arrow') {
            return
        }

        if (this.activeTool === 'hand') {
            const image = this.getImageAtPosition(e.clientX, e.clientY)

            if (image) {
                this.isImageDragging = true
                this.selectedImage = image
                this.startDragOffset = {
                    x:
                        e.clientX -
                        (image.x * this.scale + this.viewportOffset.x),
                    y:
                        e.clientY -
                        (image.y * this.scale + this.viewportOffset.y),
                }
                this.canvas.style.cursor = 'grabbing'
            } else {
                this.isDragging = true
                this.startDragOffset = {
                    x: e.clientX - this.viewportOffset.x,
                    y: e.clientY - this.viewportOffset.y,
                }
                this.canvas.style.cursor = 'grabbing'
            }
        }
    }

    onMouseUp() {
        this.isDragging = false
        this.isImageDragging = false
        this.selectedImage = null
        this.updateCursor()
    }

    getImageAtPosition(x, y) {
        return this.images.find((image) => {
            const imageX = image.x * this.scale + this.viewportOffset.x
            const imageY = image.y * this.scale + this.viewportOffset.y
            return (
                x >= imageX &&
                x <= imageX + image.width * this.scale &&
                y >= imageY &&
                y <= imageY + image.height * this.scale
            )
        })
    }

    checkButtonVisibility() {
        const hasImages = this.images.length > 0

        if (hasImages) {
            const firstImage = this.images[0]

            const imageX = firstImage.x * this.scale + this.viewportOffset.x
            const imageY = firstImage.y * this.scale + this.viewportOffset.y
            const imageWidth = firstImage.width * this.scale
            const imageHeight = firstImage.height * this.scale

            const isImageVisible =
                imageX + imageWidth > 0 &&
                imageY + imageHeight > 0 &&
                imageX < this.canvas.width &&
                imageY < this.canvas.height

            if (isImageVisible) {
                this.scrollBackButton.style.display = 'none'
            } else {
                this.scrollBackButton.style.display = 'block'
            }
        } else {
            this.scrollBackButton.style.display = 'none'
        }
    }

    scrollBackToContent() {
        if (this.images.length === 0) return

        const firstImage = this.images[0]

        const firstImageCenterX = firstImage.x + firstImage.width / 2
        const firstImageCenterY = firstImage.y + firstImage.height / 2

        const scaleAdjustedCenterX = firstImageCenterX * this.scale
        const scaleAdjustedCenterY = firstImageCenterY * this.scale

        this.viewportOffset.x = this.canvas.width / 2 - scaleAdjustedCenterX
        this.viewportOffset.y = this.canvas.height / 2 - scaleAdjustedCenterY

        this.redrawCanvas()

        this.checkButtonVisibility()
    }
}

export default CanvasManager
