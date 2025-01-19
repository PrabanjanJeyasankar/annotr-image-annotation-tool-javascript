import AnnotationSvg from '../../svg/AnnotationSvg'
import EraserSvg from '../../svg/EraserSvg'
import HandCursorSvg from '../../svg/HandCursorSvg'
import MousePointerSvg from '../../svg/MousePointerSvg'
import styles from './MenuDock.module.css'

function MenuDock(canvasManager) {
    if (!canvasManager) {
        console.error('CanvasManager is required for MenuDock')
        return document.createElement('div')
    }

    const dock = document.createElement('div')
    dock.className = styles.menuDock

    const arrowButton = createButton(MousePointerSvg, 'Arrow Tool')
    const handButton = createButton(HandCursorSvg, 'Hand Tool (Move Canvas)')
    const annotationButton = createButton(AnnotationSvg, 'Annotation Tool')
    const deleteButton = createButton(EraserSvg, 'Delete Tool')

    arrowButton.classList.add(styles.active)

    const manager = canvasManager
    const tooltip = createTooltip()

    dock.appendChild(arrowButton)
    dock.appendChild(handButton)
    dock.appendChild(annotationButton)
    dock.appendChild(deleteButton)
    dock.appendChild(tooltip)

    tooltip.style.display = 'block'

    arrowButton.onclick = function () {
        setActiveButton(arrowButton, [
            arrowButton,
            handButton,
            annotationButton,
            deleteButton,
        ])
        manager.setActiveTool('arrow')
        tooltip.style.display = 'block'
    }

    handButton.onclick = function () {
        setActiveButton(handButton, [
            arrowButton,
            handButton,
            annotationButton,
            deleteButton,
        ])
        manager.setActiveTool('hand')
        tooltip.style.display = 'none'
    }

    annotationButton.onclick = function () {
        setActiveButton(annotationButton, [
            arrowButton,
            handButton,
            annotationButton,
            deleteButton,
        ])
        manager.setActiveTool('annotation')
        tooltip.style.display = 'block'
    }

    deleteButton.onclick = function () {
        setActiveButton(deleteButton, [
            arrowButton,
            handButton,
            annotationButton,
            deleteButton,
        ])
        manager.setActiveTool('delete')
        tooltip.style.display = 'block'
    }

    applyHoverEffect([arrowButton, handButton, annotationButton, deleteButton])

    return dock
}

function setActiveButton(activeButton, allButtons) {
    allButtons.forEach((button) => {
        button.classList.remove(styles.active)
    })
    activeButton.classList.add(styles.active)
}

function createButton(iconFn, title) {
    const button = document.createElement('button')
    button.className = styles.toolButton
    button.innerHTML = iconFn()
    button.title = title
    return button
}

function createTooltip() {
    const tooltip = document.createElement('div')
    tooltip.className = styles.tooltip
    tooltip.innerText =
        'Use the Hand Tool (Move Canvas) to drag images/annotations!'
    return tooltip
}

function applyHoverEffect(buttons) {
    buttons.forEach((button, index) => {
        button.onmouseover = () => focus(index, buttons)
        button.onmouseleave = () => resetIcons(buttons)
    })
}

const resetIcons = (buttons) => {
    buttons.forEach((item) => {
        item.style.transform = 'scale(1) translateY(0px)'
    })
}

const focus = (index, buttons) => {
    resetIcons(buttons)
    const transformations = [
        { idx: index - 2, scale: 1.05, translateY: 0 },
        { idx: index - 1, scale: 1.15, translateY: -6 },
        { idx: index, scale: 1.25, translateY: -10 },
        { idx: index + 1, scale: 1.15, translateY: -6 },
        { idx: index + 2, scale: 1.05, translateY: 0 },
    ]

    transformations.forEach(({ idx, scale, translateY }) => {
        if (buttons[idx]) {
            buttons[
                idx
            ].style.transform = `scale(${scale}) translateY(${translateY}px)`
        }
    })
}

export default MenuDock
