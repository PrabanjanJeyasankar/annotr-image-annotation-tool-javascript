import AnnotationEvents from '../../utils/AnnotationEvents'

class AnnotationForm {
    constructor() {
        this.element = this._createFormElement()
        this.currentAnnotation = null
        this._setupEventListeners()
    }

    _createFormElement() {
        const form = document.createElement('div')
        form.className = 'annotation-form'
        form.innerHTML = `
            <textarea class="annotation-textarea" placeholder="Enter annotation..."></textarea>
            <div class="annotation-actions">
                <button class="save-btn">Save</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        `
        form.style.cssText = this._getFormStyles()
        document.body.appendChild(form)
        return form
    }

    _getFormStyles() {
        return `
            position: fixed;
            display: none;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        `
    }

    _setupEventListeners() {
        const saveBtn = this.element.querySelector('.save-btn')
        const cancelBtn = this.element.querySelector('.cancel-btn')

        saveBtn.addEventListener('click', () => this._handleSave())
        cancelBtn.addEventListener('click', () => this.hide())
    }

    show(position, existingAnnotation = null) {
        this.currentAnnotation = existingAnnotation

        const textarea = this.element.querySelector('.annotation-textarea')
        textarea.value = existingAnnotation ? existingAnnotation.content : ''

        this.element.style.left = `${position.x}px`
        this.element.style.top = `${position.y}px`
        this.element.style.display = 'block'
        textarea.focus()
    }

    hide() {
        this.element.style.display = 'none'
        this.currentAnnotation = null
    }

    _handleSave() {
        const content = this.element
            .querySelector('.annotation-textarea')
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
}

export default AnnotationForm
