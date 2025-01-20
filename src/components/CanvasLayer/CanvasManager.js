import AnnotationManager from '../Annotation/AnnotationManager'
import styles from './Canvas.module.css'

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
        this.prevX = null
        this.prevY = null

        this.activeTool = 'arrow'
        this.setActiveTool('arrow')
        this.defaultCursor = 'default'

        this.supportedTools = ['arrow', 'hand', 'annotation', 'erase']

        this.canvas.canvasManager = this
        this.annotationManager = new AnnotationManager(this.canvas, this)

        this.messageTimeout = null
        this.messageEl = this._createMessageElement()

        this._setupEventListeners()
        this.checkButtonVisibility()
    }

    hasImages() {
        return this.images.length > 0
    }

    addImage(img, id, x, y, width, height) {
        const imageWithAnnotations = new ImageWithAnnotations(
            img,
            id,
            x,
            y,
            width,
            height
        )
        this.images.push(imageWithAnnotations)
        return imageWithAnnotations
    }

    _setupEventListeners() {
        this.canvas.addEventListener('wheel', this.onWheel.bind(this))
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
        this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this))
    }

    _createMessageElement() {
        const el = document.createElement('div')
        el.className = styles.messageElement
        document.body.appendChild(el)
        return el
    }

    showMessage(message, duration = 3000) {
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout)
        }
        this.messageEl.textContent = message
        this.messageEl.style.display = 'block'
        this.messageTimeout = setTimeout(() => {
            this.messageEl.style.display = 'none'
        }, duration)
    }

    setActiveTool(tool) {
        this.activeTool = tool
        this.isDragging = false
        this.isImageDragging = false
        this.selectedImage = null

        switch (tool) {
            case 'hand':
                this.canvas.style.cursor = 'grab'
                break
            case 'annotation':
                this.canvas.style.cursor = 'crosshair'
                break
            case 'erase':
                this.canvas.style.cursor = 'pointer'
                break
            case 'arrow':
            default:
                this.canvas.style.cursor = 'default'
        }

        if (this.annotationManager) {
            this.annotationManager.isDraggingAnnotation = false
            this.annotationManager.selectedAnnotation = null
        }
    }

    setToolCursor(tool) {
        switch (tool) {
            case 'arrow':
                this.lastToolCursor = 'default'
                break
            case 'hand':
                this.lastToolCursor = 'grab'
                break
            case 'annotation':
                this.lastToolCursor = 'crosshair'
                break
            case 'erase':
                this.lastToolCursor = 'pointer'
                break
            default:
                this.lastToolCursor = 'default'
        }
        this.canvas.style.cursor = this.lastToolCursor
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

        this.annotationManager.redraw({
            scale: this.scale,
            offset: this.viewportOffset,
        })
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
        const annotationHandled = this.annotationManager.handleMouseMove(e)
        if (annotationHandled) return

        if (this.prevX === null || this.prevY === null) return

        if (this.activeTool === 'hand') {
            if (this.isImageDragging && this.selectedImage) {
                const deltaX = (e.clientX - this.prevX) / this.scale
                const deltaY = (e.clientY - this.prevY) / this.scale

                this.selectedImage.moveBy(deltaX, deltaY)

                if (this.annotationManager.form.isVisible()) {
                    const currentAnnotation =
                        this.annotationManager.form.getCurrentAnnotation()
                    if (
                        currentAnnotation &&
                        currentAnnotation.imageId === this.selectedImage.id
                    ) {
                        const annotationX =
                            currentAnnotation.position.x * this.scale +
                            this.viewportOffset.x
                        const annotationY =
                            currentAnnotation.position.y * this.scale +
                            this.viewportOffset.y

                        this.annotationManager.form.updatePosition({
                            x: annotationX + 10,
                            y: annotationY + 10,
                        })
                    }
                }

                this.canvas.style.cursor = 'grabbing'
                this.redrawCanvas()
            } else if (this.isDragging) {
                this.viewportOffset.x += e.clientX - this.prevX
                this.viewportOffset.y += e.clientY - this.prevY
                this.canvas.style.cursor = 'grabbing'
                this.redrawCanvas()
            } else {
                this.canvas.style.cursor = 'grab'
            }
        }

        this.prevX = e.clientX
        this.prevY = e.clientY
    }

    addAnnotationToImage(imageId, annotationId) {
        if (!this.imageAnnotations.has(imageId)) {
            this.imageAnnotations.set(imageId, new Set())
        }
        this.imageAnnotations.get(imageId).add(annotationId)
    }

    removeAnnotationFromImage(imageId, annotationId) {
        const imageAnnotations = this.imageAnnotations.get(imageId)
        if (imageAnnotations) {
            imageAnnotations.delete(annotationId)
        }
    }

    onMouseDown(e) {
        this.prevX = e.clientX
        this.prevY = e.clientY

        if (this.activeTool === 'erase') {
            const clickedImage = this.getImageAtPosition(e.clientX, e.clientY)
            if (clickedImage) {
                this.deleteImage(clickedImage)
                return
            }
        }

        if (this.activeTool === 'annotation') {
            const clickedImage = this.getImageAtPosition(e.clientX, e.clientY)
            if (!clickedImage) {
                this.showMessage(
                    'Please add annotations to an existing image or import a new one to get started.'
                )
                return
            }
            const canvasCoords = this.convertToCanvasCoordinates(
                e.clientX,
                e.clientY
            )
            this.annotationManager.handleImageClick(
                clickedImage,
                canvasCoords,
                {
                    clientX: e.clientX,
                    clientY: e.clientY,
                }
            )
            return
        }

        const annotationHandled = this.annotationManager.handleMouseDown(e)
        if (annotationHandled) return

        if (this.activeTool === 'hand') {
            const image = this.getImageAtPosition(e.clientX, e.clientY)
            if (image) {
                this.isImageDragging = true
                this.selectedImage = image
                this.canvas.style.cursor = 'grabbing'
            } else {
                this.isDragging = true
                this.canvas.style.cursor = 'grabbing'
            }
        }
    }

    onMouseUp(e) {
        const annotationHandled = this.annotationManager.handleMouseUp(e)
        if (annotationHandled) return

        this.isDragging = false
        this.isImageDragging = false
        this.selectedImage = null

        switch (this.activeTool) {
            case 'hand':
                this.canvas.style.cursor = 'grab'
                break
            case 'annotation':
                this.canvas.style.cursor = 'crosshair'
                break
            case 'erase':
                this.canvas.style.cursor = 'pointer'
                break
            default:
                this.canvas.style.cursor = 'default'
        }

        this.prevX = null
        this.prevY = null
    }

    onMouseLeave(e) {
        this.onMouseUp(e)
    }

    deleteImage(image) {
        const isImageHaveAnyOpenForm =
            this.annotationManager.form.isVisible() &&
            this.annotationManager.form.getCurrentAnnotation()?.imageId ===
                image.id

        if (isImageHaveAnyOpenForm) {
            this.annotationManager.form.hide()
        }

        if (image.annotations) {
            image.annotations = []
        }

        const imageIndex = this.images.findIndex((img) => img === image)
        if (imageIndex !== -1) {
            this.images.splice(imageIndex, 1)
        }

        this.redrawCanvas()
        this.checkButtonVisibility()

        const deleteEvent = new CustomEvent('imageDeleted', {
            detail: { imageId: image.id },
        })
        window.dispatchEvent(deleteEvent)
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

    convertToCanvasCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect()
        return {
            x: (clientX - rect.left - this.viewportOffset.x) / this.scale,
            y: (clientY - rect.top - this.viewportOffset.y) / this.scale,
        }
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
