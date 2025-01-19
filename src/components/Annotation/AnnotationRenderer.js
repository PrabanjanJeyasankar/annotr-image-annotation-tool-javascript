class AnnotationRenderer {
    constructor(context) {
        this.ctx = context
        this.dotRadius = 8
        this.dotColor = '#6965db'
    }

    setStyle(options = {}) {
        this.dotRadius = options.radius || this.dotRadius
        this.dotColor = options.color || this.dotColor
    }

    drawAnnotation(annotation, transform) {
        const { x, y } = this._transformPoint(annotation.position, transform)

        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.arc(x, y, this.dotRadius, 0, Math.PI * 2)
        this.ctx.fillStyle = this.dotColor
        this.ctx.fill()
        this.ctx.restore()
    }

    _transformPoint(point, transform) {
        return {
            x: point.x * transform.scale + transform.offset.x,
            y: point.y * transform.scale + transform.offset.y,
        }
    }
}

export default AnnotationRenderer
