class ThemeSwitcher {
    selectors = {
        root: '[data-js-todo]',
        themeSwitchButton: '[data-js-theme-switcher]',
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
        this.themeSwitchButtonElement = this.rootElement.querySelector(this.selectors.themeSwitchButton)
        this.setInitialTheme()
        this.bindEvents()
    }

    get isDarkThemeCached() {
        return localStorage.getItem(this.localStorageKey) === this.themes.dark
    }
 
    setInitialTheme() {
        document.documentElement.classList.toggle(this.stateClasses.isDarkTheme, this.isDarkThemeCached)
    }

    onClick = () => {
        localStorage.setItem(this.localStorageKey, this.isDarkThemeCached ? this.themes.light : this.themes.dark)

        document.documentElement.classList.toggle(this.stateClasses.isDarkTheme)
    }

    bindEvents() {
        this.themeSwitchButtonElement.addEventListener('click', this.onClick)
    }
}

export default ThemeSwitcher