import AnnotationEvents from '../../utils/AnnotationEvents'
import { Annotation } from '../../utils/Types.js'
import styles from './Annotation.module.css'
import AnnotationForm from './AnnotationForm'
import AnnotationRenderer from './AnnotationRenderer'
import AnnotationStore from './AnnotationStore'

class AnnotationManager {
    constructor(canvas) {
        this.canvas = canvas
        this.store = new AnnotationStore()
        this.renderer = new AnnotationRenderer(canvas.getContext('2d'))
        this.form = new AnnotationForm()
        this.tooltip = this._createTooltip()
        this.isDraggingAnnotation = false
        this.selectedAnnotation = null
        this.dragOffset = { x: 0, y: 0 }
        this._setupEventListeners()
    }

    _setupEventListeners() {
        window.addEventListener(
            AnnotationEvents.SAVE,
            this._handleSave.bind(this)
        )
        this.canvas.addEventListener(
            'mousemove',
            this.handleMouseMove.bind(this)
        )
        this.canvas.addEventListener(
            'mousedown',
            this.handleMouseDown.bind(this)
        )
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
    }

    _createTooltip() {
        const tooltip = document.createElement('div')
        tooltip.className = styles.annotationTooltip
        tooltip.style.display = 'none'
        document.body.appendChild(tooltip)
        return tooltip
    }

    handleMouseMove(event) {
        const canvasManager = this.canvas.canvasManager
        if (!canvasManager) return false

        const canvasPoint = this._getCanvasPoint(event)
        const hoveredAnnotation = this._findClickedAnnotation(canvasPoint)

        if (this.isDraggingAnnotation && this.selectedAnnotation) {
            event.preventDefault()
            event.stopPropagation()

            const rect = this.canvas.getBoundingClientRect()
            const mouseX =
                (event.clientX - rect.left - canvasManager.viewportOffset.x) /
                canvasManager.scale
            const mouseY =
                (event.clientY - rect.top - canvasManager.viewportOffset.y) /
                canvasManager.scale

            const parentImage = canvasManager.images.find(
                (img) => img.id === this.selectedAnnotation.imageId
            )

            if (parentImage) {
                const margin = 10
                const minX = parentImage.x + margin
                const maxX = parentImage.x + parentImage.width - margin
                const minY = parentImage.y + margin
                const maxY = parentImage.y + parentImage.height - margin

                const newX = Math.min(
                    Math.max(mouseX - this.dragOffset.x, minX),
                    maxX
                )
                const newY = Math.min(
                    Math.max(mouseY - this.dragOffset.y, minY),
                    maxY
                )

                this.selectedAnnotation.position.x = newX
                this.selectedAnnotation.position.y = newY

                canvasManager.redrawCanvas()
            }

            return true
        }

        if (hoveredAnnotation) {
            this.tooltip.textContent = hoveredAnnotation.content
            this.tooltip.style.display = 'block'
            this.tooltip.style.left = `${event.clientX + 10}px`
            this.tooltip.style.top = `${event.clientY + 10}px`
            this.canvas.style.cursor = 'grab'
            return true
        } else {
            this.tooltip.style.display = 'none'
            if (!this.isDraggingAnnotation) {
                this.canvas.style.cursor =
                    canvasManager.activeTool === 'annotation'
                        ? 'crosshair'
                        : 'default'
            }
            return false
        }
    }

    handleMouseDown(event) {
        const canvasManager = this.canvas.canvasManager
        if (!canvasManager) return false

        const canvasPoint = this._getCanvasPoint(event)
        const clickedAnnotation = this._findClickedAnnotation(canvasPoint)

        if (clickedAnnotation) {
            event.preventDefault()
            event.stopPropagation()

            this.isDraggingAnnotation = true
            this.selectedAnnotation = clickedAnnotation

            this.dragOffset = {
                x: canvasPoint.x - clickedAnnotation.position.x,
                y: canvasPoint.y - clickedAnnotation.position.y,
            }

            this.canvas.style.cursor = 'grabbing'
            return true
        }

        return false
    }

    handleMouseUp(event) {
        if (this.isDraggingAnnotation) {
            event.preventDefault()
            event.stopPropagation()

            this.isDraggingAnnotation = false
            this.selectedAnnotation = null
            this.canvas.style.cursor = 'default'

            const canvasPoint = this._getCanvasPoint(event)
            const hoveredAnnotation = this._findClickedAnnotation(canvasPoint)
            if (hoveredAnnotation) {
                this.canvas.style.cursor = 'grab'
            }

            return true
        }
        return false
    }

    handleImageClick(image, canvasPoint, screenPoint) {
        if (!image) return

        const clickedAnnotation = this._findClickedAnnotation(canvasPoint)

        if (clickedAnnotation) {
            this._showExistingAnnotation(clickedAnnotation, screenPoint)
        } else {
            this._createNewAnnotation(canvasPoint, image.id, screenPoint)
        }
    }

    _findImageForAnnotation(annotation) {
        const canvasManager = this.canvas.canvasManager
        if (!canvasManager || !canvasManager.images) return null

        return canvasManager.images.find(
            (image) => image.id === annotation.imageId
        )
    }

    _findClickedAnnotation(point) {
        const annotations = []
        this.canvas.canvasManager.images.forEach((image) => {
            if (image.annotations) {
                annotations.push(...image.annotations)
            }
        })

        const clickRadius = 10 / this.canvas.canvasManager.scale

        return annotations.find((annotation) => {
            const dx = annotation.position.x - point.x
            const dy = annotation.position.y - point.y
            return Math.sqrt(dx * dx + dy * dy) < clickRadius
        })
    }

    _showExistingAnnotation(annotation, screenPoint) {
        this.form.show(
            {
                x: screenPoint.clientX,
                y: screenPoint.clientY,
            },
            annotation
        )
    }

    _createNewAnnotation(point, imageId, screenPoint) {
        this.pendingAnnotationPoint = point
        this.currentImageId = imageId

        this.form.show({
            x: screenPoint.clientX,
            y: screenPoint.clientY,
        })
    }

    _handleSave(event) {
        const { content, annotation } = event.detail

        if (annotation) {
            annotation.content = content
        } else {
            const newAnnotation = new Annotation(
                this.pendingAnnotationPoint.x,
                this.pendingAnnotationPoint.y,
                content,
                this.currentImageId
            )

            const targetImage = this.canvas.canvasManager.images.find(
                (img) => img.id === this.currentImageId
            )
            if (targetImage) {
                targetImage.addAnnotation(newAnnotation)
            }
        }

        this.redraw()
    }

    updateAnnotationsById(annotationIds, { deltaX, deltaY }) {
        const annotations = this.store
            .getAll()
            .filter((annotation) => annotationIds.includes(annotation.id))

        annotations.forEach((annotation) => {
            annotation.position.x += deltaX
            annotation.position.y += deltaY
        })

        this.redraw()
    }

    updateAnnotationsForImage(imageId, { deltaX, deltaY }) {
        const imageAnnotations = this.store.getForImage(imageId)

        if (imageAnnotations.length > 0) {
            imageAnnotations.forEach((annotation) => {
                annotation.position.x += deltaX
                annotation.position.y += deltaY
            })
            this.redraw()
        }
    }

    redraw(transform = { scale: 1, offset: { x: 0, y: 0 } }) {
        this.canvas.canvasManager.images.forEach((image) => {
            if (image.annotations) {
                image.annotations.forEach((annotation) => {
                    this.renderer.drawAnnotation(annotation, transform)
                })
            }
        })
    }

    _getCanvasPoint(event) {
        const canvasManager = this.canvas.canvasManager
        const rect = this.canvas.getBoundingClientRect()

        return {
            x:
                (event.clientX - rect.left - canvasManager.viewportOffset.x) /
                canvasManager.scale,
            y:
                (event.clientY - rect.top - canvasManager.viewportOffset.y) /
                canvasManager.scale,
        }
    }
}

export default AnnotationManager
