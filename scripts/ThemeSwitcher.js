import MatchMedia from './MatchMedia.js'

class ThemeSwitcher {
    selectors = {
        root: '[data-js-todo]',
        switchThemeButton: '[data-js-theme-switcher]',
    }

    stateClasses = {
        isDarkTheme: 'is-dark-theme',
    }

    themes = {
        light: 'light',
        dark: 'dark',
    }

    localStorageKey = 'theme'

    constructor() {
        this.rootElement = document.querySelector(this.selectors.root)
        this.switchThemeButtonElement = this.rootElement.querySelector(this.selectors.switchThemeButton)
        this.setInitialTheme()
        this.bindEvents()
    }

    get themeCached() {
        return localStorage.getItem(this.localStorageKey)
    }

    enableDarkTheme() {
        document.documentElement.classList.add(this.stateClasses.isDarkTheme)
    }

    setInitialTheme() {
        const savedTheme = this.themeCached
        const prefersDarkTheme = MatchMedia.prefersDarkTheme.matches

        if (savedTheme === this.themes.dark) {
            this.enableDarkTheme()
        }

        if (!savedTheme && prefersDarkTheme) {
            this.enableDarkTheme()
        }
    }

    onClick = () => {
        const isDarkTheme = document.documentElement.classList.contains(this.stateClasses.isDarkTheme)

        localStorage.setItem(
            this.localStorageKey,
            isDarkTheme ? this.themes.light : this.themes.dark
        )

        document.documentElement.classList.toggle(this.stateClasses.isDarkTheme)
    }

    onMatchMediaChange = (event) => {
        if (!this.themeCached) {
            document.documentElement.classList.toggle(this.stateClasses.isDarkTheme, event.matches)
        }
    }

    bindEvents() {
        this.switchThemeButtonElement.addEventListener('click', this.onClick)
        MatchMedia.prefersDarkTheme.addEventListener('change', this.onMatchMediaChange)
    }
}

export default ThemeSwitcher