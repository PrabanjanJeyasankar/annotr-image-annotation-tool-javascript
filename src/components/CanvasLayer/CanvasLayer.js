import AddImageIcon from '../../svg/AddImageSvg.js'
import ImageUploader from '../ImageUploader/ImageUploader.js'
import MenuDock from '../MenuDock/MenuDock.js'
import styles from './Canvas.module.css'
import CanvasManager from './CanvasManager.js'

function InitializeCanvas(app) {
    app.style.overflow = 'hidden'
    app.style.position = 'fixed'
    app.style.width = '100%'
    app.style.height = '100%'

    const container = document.createElement('div')
    container.className = styles.canvasContainer
    app.appendChild(container)

    const canvas = document.createElement('canvas')
    canvas.id = 'imageCanvas'
    canvas.className = styles.canvas
    container.appendChild(canvas)

    const uploadButton = document.createElement('button')
    uploadButton.className = styles.uploadButton
    uploadButton.innerHTML = `
        ${AddImageIcon()}
        <span>Upload Image</span>
    `
    container.appendChild(uploadButton)

    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.className = styles.fileInput
    fileInput.multiple = true
    container.appendChild(fileInput)

    const scrollBackButton = document.createElement('button')
    scrollBackButton.textContent = 'Scroll Back to Content'
    scrollBackButton.className = styles.scrollBackButton
    document.body.appendChild(scrollBackButton)

    const canvasManager = new CanvasManager(canvas, scrollBackButton)

    const menuDockElement = MenuDock(canvasManager)
    app.appendChild(menuDockElement)

    const imageUploader = new ImageUploader(fileInput, canvasManager)

    uploadButton.addEventListener('click', () => fileInput.click())

    scrollBackButton.addEventListener('click', () => {
        canvasManager.scrollBackToContent()
    })

    window.addEventListener('resize', () => {
        canvasManager.resizeCanvas()
    })

    canvasManager.resizeCanvas()
    return canvas
}

export default InitializeCanvas