import BaseComponent from './BaseComponent.js'
import MatchMedia from './MatchMedia.js'

class CustomSelect extends BaseComponent {
    selectors = {
        root: '[data-js-todo-select]',
        originalControl: '[data-js-todo-select-original-control]',
        button: '[data-js-todo-select-button]',
        dropdown: '[data-js-todo-select-dropdown]',
        option: '[data-js-todo-select-option]',
    }

    stateClasses = {
        isExpanded: 'is-expanded',
        isCurrent: 'is-current',
        isSelected: 'is-selected',
    }

    stateAttributes = {
        ariaExpanded: 'aria-expanded',
        ariaSelected: 'aria-selected',
        ariaActiveDescendant: 'aria-activedescendant',
    }

    initialState = {
        isExpanded: false,
        currentOptionIndex: null,
        selectedOptionElement: null,
    }

    constructor() {
        super()
        this.rootElement = document.querySelector(this.selectors.root)
        this.originalControlElement = this.rootElement.querySelector(this.selectors.originalControl)
        this.buttonElement = this.rootElement.querySelector(this.selectors.button)
        this.dropdownElement = this.rootElement.querySelector(this.selectors.dropdown)
        this.optionElements = this.dropdownElement.querySelectorAll(this.selectors.option)
        this.state = this.getProxyState({
            ...this.initialState,
            currentOptionIndex: this.originalControlElement.selectedIndex,
            selectedOptionElement: this.optionElements[this.originalControlElement.selectedIndex],
        })
        this.updateTabIndexes()
        this.bindEvents()
    }

    updateUI() {
        const {
            isExpanded,
            currentOptionIndex,
            selectedOptionElement,
        } = this.state

        const newSelectedOptionValue = selectedOptionElement.textContent.trim()        

        const updateOriginalControl = () => {
            this.originalControlElement.value = newSelectedOptionValue
        }

        const updateButton = () => {
            this.buttonElement.textContent = newSelectedOptionValue
            this.buttonElement.classList.toggle(this.stateClasses.isExpanded, isExpanded)
            this.buttonElement.setAttribute(this.stateAttributes.ariaExpanded, isExpanded)
            this.buttonElement.setAttribute(
                this.stateAttributes.ariaActiveDescendant,
                this.optionElements[this.state.currentOptionIndex].id
            )
        }

        const updateDropdown = () => {
            this.dropdownElement.classList.toggle(this.stateClasses.isExpanded, isExpanded)
        }

        const updateOption = () => {
            this.optionElements.forEach((optionElement, index) => {
                const isCurrent = this.state.currentOptionIndex === index
                const isSelected = this.state.selectedOptionElement === optionElement

                optionElement.classList.toggle(this.stateClasses.isCurrent, isCurrent)
                optionElement.classList.toggle(this.stateClasses.isSelected, isSelected)
                optionElement.setAttribute(this.stateAttributes.ariaSelected, isSelected)
            })
        }

        updateOriginalControl()
        updateButton()
        updateDropdown()
        updateOption()
    }

    updateTabIndexes(isMobileDevice = MatchMedia.mobile.matches) {
        this.originalControlElement.tabIndex = isMobileDevice ? 0 : -1
        this.buttonElement.tabIndex = isMobileDevice ? -1 : 0
    }

    toggleExpandState() {
        this.state.isExpanded = !this.state.isExpanded
    }

    expand() {
        this.state.isExpanded = true
    }

    collapse() {
        this.state.isExpanded = false
    }

    get isNeedToExpand() {
        const isButtonFocused = document.activeElement === this.buttonElement

        return (!this.state.isExpanded && isButtonFocused)
    }

    onArrowUpKeyDown = () => {
        if (this.isNeedToExpand) {
            this.expand()

            return
        }

        if (this.state.currentOptionIndex > 0) {
            this.state.currentOptionIndex--
        }
    }

    onArrowDownKeyDown = () => {
        if (this.isNeedToExpand) {
            this.expand()

            return
        }

        if (this.state.currentOptionIndex < this.optionElements.length - 1) {
            this.state.currentOptionIndex++
        }
    }

    onApplyKeyDown = () => {
        if (this.isNeedToExpand) {
            this.expand()

            return
        }

        this.state.selectedOptionElement = this.optionElements[this.state.currentOptionIndex]
        this.collapse()
    }

    onEscapeKeyDown = () => {
        this.collapse()
    }

    onButtonClick = () => {
        this.toggleExpandState()
    }

    onClick = ({ target }) => {
        const isButtonClick = target === this.buttonElement
        const isOutsideDropdownClick = target.closest(this.selectors.dropdown) !== this.dropdownElement

        if (!isButtonClick && isOutsideDropdownClick) {
            this.collapse()

            return
        }

        const isOptionClick = target.matches(this.selectors.option)

        if (isOptionClick) {
            this.state.selectedOptionElement = target
            this.state.currentOptionIndex =
                [...this.optionElements].findIndex((optionElement) => optionElement === target)
            this.originalControlElement.dispatchEvent(new Event('selectChange'))
            this.collapse()
        }
    }

    onKeyDown = (event) => {
        const { code } = event

        const action = {
            ArrowUp: this.onArrowUpKeyDown,
            ArrowDown: this.onArrowDownKeyDown,
            Enter: this.onApplyKeyDown,
            Space: this.onApplyKeyDown,
            Escape: this.onEscapeKeyDown,
        }[code]

        if (action) {
            event.preventDefault()
            action()
        }
    }

    onMobileMatchMediaChange = (event) => {
        this.updateTabIndexes(event.matches)
    }

    onOriginalControlChange = () => {
        this.state.currentOptionIndex = this.originalControlElement.selectedIndex
        this.state.selectedOptionElement = this.optionElements[this.originalControlElement.selectedIndex]
    }

    bindEvents() {
        MatchMedia.mobile.addEventListener('change', this.onMobileMatchMediaChange)
        this.buttonElement.addEventListener('click', this.onButtonClick)
        document.addEventListener('click', this.onClick)
        this.rootElement.addEventListener('keydown', this.onKeyDown)
        this.originalControlElement.addEventListener('change', this.onOriginalControlChange)
    }
}

export default CustomSelect