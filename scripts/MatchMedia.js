const MatchMedia = {
    mobile: window.matchMedia('(width <= 767.98px)'),
    prefersDarkTheme: window.matchMedia('(prefers-color-scheme: dark)'),
}

export default MatchMedia