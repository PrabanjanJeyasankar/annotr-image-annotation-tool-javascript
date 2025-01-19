class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class Annotation {
    constructor(x, y, content, imageId) {
        this.id = Math.random().toString(36).substr(2, 9)
        this.position = { x, y }
        this.content = content
        this.imageId = imageId
    }
}

export { Annotation, Point }
