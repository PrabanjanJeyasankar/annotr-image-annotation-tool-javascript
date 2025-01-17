import { NavigationBar } from './components/NavigationBar/NavigationBar'

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app')
    const navbar = NavigationBar()

    app.appendChild(navbar)
})
