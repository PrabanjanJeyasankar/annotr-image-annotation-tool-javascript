class AnnotationStore {
    constructor() {
        this.annotations = []
    }

    add(annotation) {
        this.annotations.push(annotation)
    }

    remove(annotationId) {
        const index = this.annotations.findIndex((a) => a.id === annotationId)
        if (index !== -1) {
            this.annotations.splice(index, 1)
        }
    }

    getAll() {
        return this.annotations
    }

    getForImage(imageId) {
        return this.annotations.filter(
            (annotation) => annotation.imageId === imageId
        )
    }

    getById(annotationId) {
        return this.annotations.find((a) => a.id === annotationId)
    }
}

export default AnnotationStore
