class AnnotationRenderer {
    constructor(context) {
        this.ctx = context
        this.outerDotRadius = 14
        this.innerDotRadius = 7
        this.outerDotColor = '#ffdfdf'
        this.innerDotColor = '#ff4343'
    }

    setStyle(options = {}) {
        this.outerDotRadius = options.outerRadius || this.outerDotRadius
        this.innerDotRadius = options.innerRadius || this.innerDotRadius
        this.outerDotColor = options.outerColor || this.outerDotColor
        this.innerDotColor = options.innerColor || this.innerDotColor
    }

    drawAnnotation(annotation, transform) {
        const { x, y } = this._transformPoint(annotation.position, transform)

        this.ctx.save()

        this.ctx.beginPath()
        this.ctx.arc(x, y, this.outerDotRadius, 0, Math.PI * 2)
        this.ctx.fillStyle = this.outerDotColor
        this.ctx.fill()

        this.ctx.beginPath()
        this.ctx.arc(x, y, this.innerDotRadius, 0, Math.PI * 2)
        this.ctx.fillStyle = this.innerDotColor
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
