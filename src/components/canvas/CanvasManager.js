class CanvasManager {
    constructor(canvasElement) {
        this.canvas = canvasElement
        this.ctx = this.canvas.getContext('2d')
        this.viewportOffset = { x: 0, y: 0 }
        this.scale = 1
        this.images = []
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.redrawCanvas()
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.createGrid()
        this.drawImages()
    }

    createGrid() {
        const gridSize = 20 * this.scale
        const offsetX = this.viewportOffset.x % gridSize
        const offsetY = this.viewportOffset.y % gridSize

        this.ctx.strokeStyle = '#e0e0e0'
        this.ctx.lineWidth = 1

        for (let x = offsetX; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath()
            this.ctx.moveTo(x, 0)
            this.ctx.lineTo(x, this.canvas.height)
            this.ctx.stroke()
        }

        for (let y = offsetY; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath()
            this.ctx.moveTo(0, y)
            this.ctx.lineTo(this.canvas.width, y)
            this.ctx.stroke()
        }
    }

    drawImages(images) {
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
}

export default CanvasManager
