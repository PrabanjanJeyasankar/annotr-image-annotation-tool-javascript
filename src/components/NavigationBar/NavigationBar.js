import styles from './NavigationBar.module.css'

export function NavigationBar() {
    const navigationBar = document.createElement('nav')
    navigationBar.className = styles.navigationBarStyle
    const title = document.createElement('h1')
    title.className = styles.navigationTitle
    title.textContent = 'Annotr'

    navigationBar.appendChild(title)

    return navigationBar
}
