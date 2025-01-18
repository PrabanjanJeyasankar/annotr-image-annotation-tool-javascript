class CanvasManager {
    constructor(canvasElement) {
        this.canvas = canvasElement
        this.ctx = this.canvas.getContext('2d')
        this.viewportOffset = { x: 0, y: 0 }
        this.scale = 1
        this.images = []
        this.canvas.addEventListener('wheel', this.onWheel.bind(this))
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

            if (newScale > 0.1 && newScale < 5) {
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
    }
}

export default CanvasManager
