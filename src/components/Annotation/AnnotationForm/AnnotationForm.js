import AnnotationEvents from '../../../utils/AnnotationEvents'
import styles from './AnnotationForm.module.css'

class AnnotationForm {
    constructor() {
        this.element = this._createFormElement()
        this.currentAnnotation = null
        this.isEditing = false
        this.visible = false
        this._setupEventListeners()
    }

    _createFormElement() {
        const form = document.createElement('div')
        form.className = styles.annotationForm
        form.innerHTML = `
            <div class="${styles.annotationContent}">
                <div class="${styles.annotationMain}">
                    <textarea 
                        class="${styles.annotationTextarea}" 
                        placeholder="Enter annotation..."
                    ></textarea>
                    <div class="${styles.annotationControls}">
                        <div class="${styles.leftControls}">
                            <button class="${styles.actionButton} ${styles.deleteButton}" title="Delete">
                                <svg
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'>
                                    <path
                                        d='M5.47058 6.01471V18.5294C5.47058 19.251 5.75721 19.943 6.26742 20.4532C6.77763 20.9634 7.46962 21.25 8.19117 21.25H15.8088C16.5304 21.25 17.2224 20.9634 17.7326 20.4532C18.2428 19.943 18.5294 19.251 18.5294 18.5294V6.01471'
                                        stroke='currentColor'
                                        strokeWidth='4'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M3.29411 6.01471H20.7059'
                                        stroke='currentColor'
                                        strokeWidth='4'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M8.73529 6.01471V4.38235C8.73529 3.94943 8.90727 3.53423 9.2134 3.2281C9.51952 2.92198 9.93472 2.75 10.3676 2.75H13.6323C14.0653 2.75 14.4805 2.92198 14.7866 3.2281C15.0927 3.53423 15.2647 3.94943 15.2647 4.38235V6.01471'
                                        stroke='currentColor'
                                        strokeWidth='4'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </button>
                             <button class="${styles.actionButton} ${styles.editButton}" title="Edit">
                                 <svg
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'>
                                    <path
                                        d='M2.77732 19.7825L3.38442 15.6213C3.421 15.3489 3.54532 15.0958 3.73856 14.9004L15.5011 3.12516C15.6535 2.9712 15.8428 2.85895 16.051 2.79915C16.2592 2.73936 16.4792 2.73403 16.6901 2.78367C17.7701 3.08264 18.749 3.66828 19.5232 4.47849C20.3307 5.25768 20.9121 6.24112 21.2054 7.32428C21.255 7.53511 21.2497 7.75515 21.1899 7.96333C21.1301 8.1715 21.0178 8.36084 20.8639 8.51318L9.08864 20.2758C8.8932 20.469 8.64012 20.5933 8.36771 20.6299L4.20654 21.237C4.01002 21.2654 3.80959 21.2471 3.62145 21.1836C3.43332 21.1202 3.26277 21.0133 3.12361 20.8717C2.98445 20.73 2.88059 20.5577 2.82043 20.3684C2.76027 20.1792 2.7455 19.9785 2.77732 19.7825Z'
                                        stroke='currentColor'
                                        strokeWidth='4'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M13.2751 5.36383L18.6378 10.7266'
                                        stroke='currentColor'
                                        strokeWidth='4'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg> 
                            </button>
                        </div>
                        <div class="${styles.rightControls}">
                            <button class="${styles.primaryButton}"></button>
                        </div>
                    </div>
                </div>
            </div>
        `

        form.style.cssText = `
            position: fixed;
            display: none;
            z-index: 1000;
        `

        document.body.appendChild(form)
        return form
    }

    _setupEventListeners() {
        const saveButton = this.element.querySelector(
            `.${styles.primaryButton}`
        )
        const editButton = this.element.querySelector(`.${styles.editButton}`)
        const deleteButton = this.element.querySelector(
            `.${styles.deleteButton}`
        )

        saveButton.addEventListener('click', () => this._handleSave())
        editButton.addEventListener('click', () => this._handleEdit())
        deleteButton.addEventListener('click', () => this._handleDelete())
    }

    show(position, existingAnnotation = null) {
        this.currentAnnotation = existingAnnotation
        this.isEditing = !existingAnnotation
        this.visible = true

        const textarea = this.element.querySelector(
            `.${styles.annotationTextarea}`
        )
        const leftControls = this.element.querySelector(
            `.${styles.leftControls}`
        )
        const primaryButton = this.element.querySelector(
            `.${styles.primaryButton}`
        )

        textarea.value = existingAnnotation ? existingAnnotation.content : ''
        textarea.readOnly = existingAnnotation ? true : false
        leftControls.style.display = existingAnnotation ? 'flex' : 'none'
        primaryButton.textContent = this.isEditing ? 'Save' : 'Close'

        this.element.style.left = `${position.x}px`
        this.element.style.top = `${position.y}px`
        this.element.style.display = 'block'

        if (!existingAnnotation || this.isEditing) {
            textarea.focus()
        }
    }

    hide() {
        this.element.style.display = 'none'
        this.currentAnnotation = null
        this.isEditing = false
        this.visible = false
    }

    isVisible() {
        return this.visible
    }

    getCurrentAnnotation() {
        return this.currentAnnotation
    }

    updatePosition(position) {
        if (!this.element) return

        this.element.style.left = `${position.x}px`
        this.element.style.top = `${position.y}px`
    }

    _handleSave() {
        if (this.currentAnnotation && !this.isEditing) {
            this.hide()
            return
        }

        const content = this.element
            .querySelector(`.${styles.annotationTextarea}`)
            .value.trim()
        if (!content) return

        const event = new CustomEvent(AnnotationEvents.SAVE, {
            detail: {
                content,
                annotation: this.currentAnnotation,
            },
        })
        window.dispatchEvent(event)
        this.hide()
    }

    _handleEdit() {
        const textarea = this.element.querySelector(
            `.${styles.annotationTextarea}`
        )
        const primaryButton = this.element.querySelector(
            `.${styles.primaryButton}`
        )

        this.isEditing = true
        textarea.readOnly = false
        textarea.focus()

        const textLength = textarea.value.length
        textarea.setSelectionRange(textLength, textLength)

        primaryButton.textContent = 'Save'
    }

    _handleDelete() {
        if (this.currentAnnotation) {
            const event = new CustomEvent(AnnotationEvents.DELETE, {
                detail: {
                    annotation: this.currentAnnotation,
                },
            })
            window.dispatchEvent(event)
            this.hide()
        }
    }
}

export default AnnotationForm
