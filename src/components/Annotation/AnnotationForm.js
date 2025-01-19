import styles from './Annotation.module.css'

class AnnotationForm {
    constructor() {
        this.element = this._createFormElement()
        this.currentAnnotation = null
        this._setupEventListeners()
    }

    _createFormElement() {
        const form = document.createElement('div');
        form.className = styles.annotationForm; // Apply the CSS module class
        form.innerHTML = `
            <textarea class="${styles.annotationTextarea}" placeholder="Enter annotation..."></textarea>
            <div class="${styles.annotationActions}">
                <button class="${styles.iconButton} ${styles.deleteButton}" data-action="delete" style="display: none;">
                    ${this._loadSVG('../../svg/TrashSvg.js')}
                </button>
                <button class="${styles.iconButton} ${styles.editButton}" data-action="edit" style="display: none;">
                    ${this._loadSVG('../../svg/EditPenSvg.js')}
                </button>
                <button class="${styles.updateButton}" data-action="update" style="display: none;">Update</button>
                <button class="${styles.saveButton}" data-action="save">Save</button>
            </div>
        `;
        document.body.appendChild(form);
        return form;
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
            width: 300px;
        `
    }

    _setupEventListeners() {
        const saveButton = this.element.querySelector('.saveButton')
        const updateButton = this.element.querySelector('.updateButton')
        const deleteButton = this.element.querySelector('.deleteButton')
        const editButton = this.element.querySelector('.editButton')

        saveButton.addEventListener('click', () => this._handleSave())
        updateButton.addEventListener('click', () => this._handleUpdate())
        deleteButton.addEventListener('click', () => this._handleDelete())
        editButton.addEventListener('click', () => this._handleEdit())
    }

    show(position, existingAnnotation = null) {
        this.currentAnnotation = existingAnnotation

        const textarea = this.element.querySelector('.annotationTextarea')
        const deleteButton = this.element.querySelector('.deleteButton')
        const editButton = this.element.querySelector('.editButton')
        const updateButton = this.element.querySelector('.updateButton')
        const saveButton = this.element.querySelector('.saveButton')

        if (existingAnnotation) {
            textarea.value = existingAnnotation.content
            deleteButton.style.display = 'inline-flex'
            editButton.style.display = 'inline-flex'
            updateButton.style.display = 'inline-flex'
            saveButton.style.display = 'none'
        } else {
            textarea.value = ''
            deleteButton.style.display = 'none'
            editButton.style.display = 'none'
            updateButton.style.display = 'none'
            saveButton.style.display = 'inline-flex'
        }

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
            .querySelector('.annotationTextarea')
            .value.trim()
        if (!content) return

        const event = new CustomEvent('annotation-save', {
            detail: { content, annotation: this.currentAnnotation },
        })
        window.dispatchEvent(event)
        this.hide()
    }

    _handleUpdate() {
        if (this.currentAnnotation) {
            const content = this.element
                .querySelector('.annotationTextarea')
                .value.trim()
            this.currentAnnotation.content = content

            const event = new CustomEvent('annotation-update', {
                detail: this.currentAnnotation,
            })
            window.dispatchEvent(event)
            this.hide()
        }
    }

    _handleDelete() {
        if (this.currentAnnotation) {
            const event = new CustomEvent('annotation-delete', {
                detail: this.currentAnnotation,
            })
            window.dispatchEvent(event)
            this.hide()
        }
    }

    _handleEdit() {
        this.element.querySelector('.annotationTextarea').focus()
    }

    _loadSVG(filePath) {
        // Load SVG as a string (e.g., via fetch or file loader)
        return `
            <img src="${filePath}" alt="icon" />
        `
    }
}

export default AnnotationForm
