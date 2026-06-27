import BaseComponent from "./BaseComponent.js";
import matchMedia from "./MatchMedia.js";

const rootSelector = '[data-js-select]'

class CustomSelect extends BaseComponent {
    selectors = {
        root: rootSelector,
        originalControl: '[data-js-select-original-control]',
        button: '[data-js-select-button]',
        dropdown: '[data-js-select-dropdown]',
        option: '[data-js-select-option]',
    }

    stateClasses = {
        isExpanded: 'is-expanded',
        isSelected: 'is-selected',
        isCurrent: 'is-current',
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

    constructor(rootElement) {
        super()
        this.rootElement = rootElement
        this.originalControlElement = this.rootElement.querySelector(this.selectors.originalControl)
        this.buttonElement = this.rootElement.querySelector(this.selectors.button)
        this.dropdownElement = this.rootElement.querySelector(this.selectors.dropdown)
        this.optionElements = this.dropdownElement.querySelectorAll(this.selectors.option)
        this.state = this.getProxyState({
            ...this.initialState,
            currentOptionIndex: this.originalControlElement.selectedIndex,
            selectedOptionElement: this.optionElements[this.originalControlElement.selectedIndex]
        })
        this.updateTabIndexes()
        this.bindEvents()
    }

    render() {
        const {
            isExpanded,
            currentOptionIndex,
            selectedOptionElement,
        } = this.state

        const newSelectedOptionValue = this.buttonElement.textContent.trim()

        const updateOrginalControl = () => {
            this.originalControlElement.value = newSelectedOptionValue
        }

        const updateButton = () => {
            this.buttonElement.textContent = newSelectedOptionValue
            this.buttonElement.classList.toggle(this.stateClasses.isExpanded, isExpanded)
            this.buttonElement.setAttribute(
                this.stateAttributes.ariaActiveDescendant,
                this.optionElements[currentOptionIndex].id
            )
        }

        const updateDropdown = () => {
            this.dropdownElement.classList.toggle(this.stateClasses.isExpanded, isExpanded)
        }

        const updateOption = () => {
            this.optionElements.forEach((optionElement, index) => {
                const isCurrent = currentOptionIndex === index
                const isSelected = selectedOptionElement === optionElement

                optionElement.classList.toggle(this.stateClasses.isCurrent, isCurrent)
                optionElement.classList.toggle(this.stateClasses.isSelected, isSelected)
                optionElement.setAttribute(this.stateAttributes.ariaSelected, isSelected)
            })
        }

        updateOrginalControl()
        updateButton()
        updateDropdown()
        updateOption()
    }

    updateTabIndexes(isMobileDevice = matchMedia.mobile.matches) {
        this.originalControlElement.tabIndex = isMobileDevice ? 0 : -1
        this.buttonElement.tabIndex = isMobileDevice ? -1 : 0
    }

    toggleExpandedState() {
        this.state.isExpanded = !this.state.isExpanded
    }

    collapse() {
        this.state.isExpanded = false
    }

    onButtonClick = () => {
        this.toggleExpandedState()
    }

    onMobileMatchMediaChange = (event) => {
        this.updateTabIndexes(event.matches)
    }

    onClick = ({ target }) => {
        const isButtonClick = target === this.buttonElement
        const isOutsideDropdownClick = 
            target.closest(this.selectors.dropdown) !== this.dropdownElement

        if (!isButtonClick && isOutsideDropdownClick) {
            this.collapse()
        }
    }

    bindEvents() {
        matchMedia.mobile.addEventListener('change', this.onMobileMatchMediaChange)
        this.buttonElement.addEventListener('click', this.onButtonClick)
        document.addEventListener('click', this.onClick)
    }
}

class CustomSelectCollection {
    constructor() {
        this.init()
    }

    init() {
        document.querySelectorAll(rootSelector).forEach((element) => {
            new CustomSelect(element)
        })
    }
}

export default CustomSelectCollection