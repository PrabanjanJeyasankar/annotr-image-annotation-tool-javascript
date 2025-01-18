import ImageUploader from '../ImageUploader/ImageUploader'
import styles from './Canvas.module.css'
import CanvasManager from './CanvasManager'

function InitializeCanvas(app) {
    app.style.overflow = 'hidden'
    app.style.position = 'fixed'
    app.style.width = '100%'
    app.style.height = '100%'

    const styleSheet = document.createElement('style')
    styleSheet.textContent = Object.values(styles).join('\n')
    document.head.appendChild(styleSheet)

    const container = document.createElement('div')
    container.className = styles.canvasContainer
    app.appendChild(container)

    const canvas = document.createElement('canvas')
    canvas.id = 'imageCanvas'
    canvas.className = styles.canvas
    container.appendChild(canvas)

    const uploadButton = document.createElement('button')
    uploadButton.textContent = 'Upload Image'
    uploadButton.className = styles.uploadButton
    container.appendChild(uploadButton)

    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.className = styles.fileInput
    fileInput.multiple = true
    container.appendChild(fileInput)

    const canvasManager = new CanvasManager(canvas)
    const imageUploader = new ImageUploader(fileInput, canvasManager)

    uploadButton.addEventListener('click', () => fileInput.click())

    window.addEventListener('resize', () => canvasManager.resizeCanvas())

    canvasManager.resizeCanvas()

    return canvas
}

export default InitializeCanvas
