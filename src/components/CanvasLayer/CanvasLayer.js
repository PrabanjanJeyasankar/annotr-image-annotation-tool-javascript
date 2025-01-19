import '../../assets/index.css'
import AddImageIcon from '../../svg/AddImageSvg.js'
import AnnotrLogoSvg from '../../svg/AnnotrLogoSvg.js'
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

    const logoContainer = document.createElement('div')
    logoContainer.className = styles.logoContainer
    logoContainer.innerHTML = `
        <span>${AnnotrLogoSvg(26, 26)}</span>
        <p class="${styles.logoText}">Annotr</p>
    `
    container.appendChild(logoContainer)

    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.className = styles.fileInput
    fileInput.multiple = true
    container.appendChild(fileInput)

    const placeholder = document.createElement('button')
    placeholder.type = 'button'
    placeholder.className = styles.placeholder
    placeholder.innerHTML = `
        <div class="${styles.placeholderContent}">
          <span>${AnnotrLogoSvg(140, 140)}</span>
           <h1>Annotr</h1>
            <h3>Drop & Drop your images here</h3>
            <p>and start annotating!</p>
        </div>
    `
    container.appendChild(placeholder)

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

    const scrollBackButton = document.createElement('button')
    scrollBackButton.textContent = 'Scroll Back to Content'
    scrollBackButton.className = styles.scrollBackButton
    document.body.appendChild(scrollBackButton)

    const canvasManager = new CanvasManager(canvas, scrollBackButton)
    const menuDockElement = MenuDock(canvasManager)
    app.appendChild(menuDockElement)

    const imageUploader = new ImageUploader(fileInput, canvasManager)

    const originalAddImage = canvasManager.addImage.bind(canvasManager)
    canvasManager.addImage = (...args) => {
        placeholder.style.display = 'none'
        return originalAddImage(...args)
    }

    const triggerFileInput = () => {
        fileInput.click()
    }

    placeholder.addEventListener('click', triggerFileInput)
    placeholder.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            triggerFileInput()
        }
    })

    placeholder.style.cursor = 'pointer'
    placeholder.style.border = 'none'
    placeholder.style.background = 'none'
    placeholder.style.width = '100%'
    placeholder.style.height = '100%'

    container.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.stopPropagation()
        container.classList.add(styles.dragOver)
    })

    container.addEventListener('dragleave', (e) => {
        e.preventDefault()
        e.stopPropagation()
        container.classList.remove(styles.dragOver)
    })

    container.addEventListener('drop', (e) => {
        e.preventDefault()
        e.stopPropagation()
        container.classList.remove(styles.dragOver)

        const files = Array.from(e.dataTransfer.files).filter((file) =>
            file.type.startsWith('image/')
        )

        if (files.length > 0) {
            imageUploader.handleFileUpload({ target: { files } })
            placeholder.style.display = 'none'
        }
    })

    uploadButton.addEventListener('click', triggerFileInput)

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            placeholder.style.display = 'none'
        }
    })

    scrollBackButton.addEventListener('click', () => {
        canvasManager.scrollBackToContent()
    })

    window.addEventListener('resize', () => {
        canvasManager.resizeCanvas()
    })

    window.addEventListener('imageDeleted', () => {
        if (!canvasManager.hasImages()) {
            placeholder.style.display = 'flex'
        }
    })

    canvasManager.resizeCanvas()
    return canvas
}

export default InitializeCanvas
