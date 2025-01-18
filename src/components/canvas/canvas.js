import styles from './canvas.module.css'

export function initializeCanvas(app) {
    app.style.overflow = 'hidden'
    app.style.position = 'fixed'
    app.style.width = '100%'
    app.style.height = '100%'

    const styleSheet = document.createElement('style')
    styleSheet.textContent = Object.values(styles).join('\n')
    document.head.appendChild(styleSheet)

    const container = document.createElement('div')
    container.className = styles.canvasZontainer
    container.style.position = 'relative'
    container.style.width = '100%'
    container.style.height = '100%'
    app.appendChild(container)

    const canvas = document.createElement('canvas')
    canvas.id = 'imageCanvas'
    canvas.className = styles.canvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    container.appendChild(canvas)

    const uploadButton = document.createElement('button')
    uploadButton.textContent = 'Upload Image'
    uploadButton.className = styles.uploadButton
    container.appendChild(uploadButton)

    const ctx = canvas.getContext('2d')
    const images = []
    let viewportOffset = { x: 0, y: 0 }
    let scale = 1

    function createGrid() {
        const gridSize = 20 * scale
        const offsetX = viewportOffset.x % gridSize
        const offsetY = viewportOffset.y % gridSize

        ctx.strokeStyle = '#e0e0e0'
        ctx.lineWidth = 1

        for (let x = offsetX; x < canvas.width; x += gridSize) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, canvas.height)
            ctx.stroke()
        }

        for (let y = offsetY; y < canvas.height; y += gridSize) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(canvas.width, y)
            ctx.stroke()
        }
    }

    function drawImages() {
        ctx.save()
        ctx.scale(scale, scale)

        images.forEach((image) => {
            ctx.drawImage(
                image.img,
                image.x + viewportOffset.x / scale,
                image.y + viewportOffset.y / scale,
                image.width,
                image.height
            )
        })

        ctx.restore()
    }

    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        createGrid()
        drawImages()
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        redrawCanvas()
    })

    redrawCanvas()

    return canvas
}
