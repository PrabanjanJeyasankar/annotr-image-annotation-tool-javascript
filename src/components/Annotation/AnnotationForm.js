import AnnotationEvents from '../../utils/AnnotationEvents'

class AnnotationForm {
    constructor() {
        this.element = this._createFormElement()
        this.currentAnnotation = null
        this.isEditing = false
        this._setupEventListeners()
    }

    _createFormElement() {
        const form = document.createElement('div')
        form.className = 'annotation-form'
        form.innerHTML = `
            <div class="annotation-content">
                <div class="annotation-side-buttons">
                    <button class="edit-btn" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-btn" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
                <div class="annotation-main">
                    <textarea class="annotation-textarea" placeholder="Enter annotation..."></textarea>
                    <div class="annotation-actions">
                        <button class="primary-btn"></button>
                    </div>
                </div>
            </div>
        `
        form.style.cssText = this._getFormStyles()
        this._addStyles()
        document.body.appendChild(form)
        return form
    }

    _getFormStyles() {
        return `
            position: fixed;
            display: none;
            background: white;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        `
    }

    _addStyles() {
        const style = document.createElement('style')
        style.textContent = `
            .annotation-form .annotation-content {
                display: flex;
                gap: 12px;
            }
            
            .annotation-form .annotation-side-buttons {
                display: none;
                flex-direction: column;
                gap: 8px;
            }
            
            .annotation-form .annotation-side-buttons button {
                padding: 6px;
                border: 1px solid #e2e8f0;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .annotation-form .annotation-side-buttons button:hover {
                background: #f7fafc;
            }
            
            .annotation-form .edit-btn {
                color: #4a5568;
            }
            
            .annotation-form .delete-btn {
                color: #e53e3e;
            }
            
            .annotation-form .annotation-textarea {
                width: 200px;
                height: 80px;
                padding: 8px;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                resize: vertical;
                margin-bottom: 8px;
            }
            
            .annotation-form .primary-btn {
                padding: 6px 12px;
                background: #4299e1;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .annotation-form .primary-btn:hover {
                background: #3182ce;
            }
            
            .annotation-form .annotation-textarea[readonly] {
                background: #f7fafc;
                cursor: default;
            }
        `
        document.head.appendChild(style)
    }

    _setupEventListeners() {
        const saveBtn = this.element.querySelector('.primary-btn')
        const editBtn = this.element.querySelector('.edit-btn')
        const deleteBtn = this.element.querySelector('.delete-btn')

        saveBtn.addEventListener('click', () => this._handleSave())
        editBtn.addEventListener('click', () => this._handleEdit())
        deleteBtn.addEventListener('click', () => this._handleDelete())
    }

    show(position, existingAnnotation = null) {
        this.currentAnnotation = existingAnnotation
        this.isEditing = !existingAnnotation

        const textarea = this.element.querySelector('.annotation-textarea')
        const sideButtons = this.element.querySelector(
            '.annotation-side-buttons'
        )
        const primaryBtn = this.element.querySelector('.primary-btn')

        textarea.value = existingAnnotation ? existingAnnotation.content : ''
        textarea.readOnly = existingAnnotation ? true : false
        sideButtons.style.display = existingAnnotation ? 'flex' : 'none'
        primaryBtn.textContent = existingAnnotation ? 'Close' : 'Save'

        this.element.style.left = `${position.x}px`
        this.element.style.top = `${position.y}px`
        this.element.style.display = 'block'

        if (!existingAnnotation) {
            textarea.focus()
        }
    }

    hide() {
        this.element.style.display = 'none'
        this.currentAnnotation = null
        this.isEditing = false
    }

    _handleSave() {
        if (this.currentAnnotation && !this.isEditing) {
            this.hide()
            return
        }

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

    _handleEdit() {
        const textarea = this.element.querySelector('.annotation-textarea')
        const primaryBtn = this.element.querySelector('.primary-btn')

        this.isEditing = true
        textarea.readOnly = false
        textarea.focus()
        primaryBtn.textContent = 'Save'
    }

    _handleEdit() {
        const textarea = this.element.querySelector('.annotation-textarea')
        const primaryBtn = this.element.querySelector('.primary-btn')

        this.isEditing = true
        textarea.readOnly = false
        textarea.focus()

        const textLength = textarea.value.length
        textarea.setSelectionRange(textLength, textLength)

        primaryBtn.textContent = 'Save'
    }

    _handleDelete() {
        if (this.currentAnnotation) {
            const event = new CustomEvent(AnnotationEvents.DELETE, { 
                detail: {
                    annotation: this.currentAnnotation
                }
            })
            window.dispatchEvent(event)
            this.hide()
        } else {
            console.error('No annotation found for deletion')
        }
    }

   

    show(position, existingAnnotation = null) {
        this.currentAnnotation = existingAnnotation
        this.isEditing = !existingAnnotation

        const textarea = this.element.querySelector('.annotation-textarea')
        const sideButtons = this.element.querySelector(
            '.annotation-side-buttons'
        )
        const primaryBtn = this.element.querySelector('.primary-btn')

        textarea.value = existingAnnotation ? existingAnnotation.content : ''
        textarea.readOnly = existingAnnotation ? true : false
        sideButtons.style.display = existingAnnotation ? 'flex' : 'none'
        primaryBtn.textContent = this.isEditing ? 'Save' : 'Close'

        this.element.style.left = `${position.x}px`
        this.element.style.top = `${position.y}px`
        this.element.style.display = 'block'

        if (!existingAnnotation || this.isEditing) {
            textarea.focus()
        }
    }
}

export default AnnotationForm
