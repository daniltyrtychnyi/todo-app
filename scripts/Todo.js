import BaseComponent from "./BaseComponent.js"

class Todo extends BaseComponent {
    selectors = {
        root: '[data-js-todo]',
        searchTaskForm: '[data-js-todo-search-task-form]',
        searchTaskInput: '[data-js-todo-search-task-input]',
        list: '[data-js-todo-list]',
        item: '[data-js-todo-item]',
        itemCheckbox: '[data-js-todo-item-checkbox]',
        itemLabel: '[data-js-todo-item-label]',
        itemActions: '[data-js-todo-item-actions]',
        itemEditButton: '[data-js-todo-item-edit-button]',
        itemDeleteButton: '[data-js-todo-item-delete-button]',
        emptyMessage: '[data-js-todo-empty-message]',
        newTaskButton: '[data-js-todo-new-task-button]',
        overlay: '[data-js-overlay]',
        newTaskForm: '[data-js-overlay-new-task-form]',
        newTaskInput: '[data-js-overlay-new-task-input]',
        newTaskFormCancelButton: '[data-js-overlay-new-task-form-cancel-button]',
        newTaskFormApplyButton: '[data-js-overlay-new-task-form-apply-button]',
    }

    stateClasses = {
        isVisible: 'is-visible',
        isDisappearing: 'is-disappearing',
    }

    localStorageKey = 'todo-items'

    constructor() {
        super()
        this.rootElement = document.querySelector(this.selectors.root)
        this.searchTaskFormElement = this.rootElement.querySelector(this.selectors.searchTaskForm)
        this.searchTaskInputElement = this.rootElement.querySelector(this.selectors.searchTaskInput)
        this.listElement = this.rootElement.querySelector(this.selectors.list)
        this.emptyMessageElement = this.rootElement.querySelector(this.selectors.emptyMessage)
        this.newTaskButtonElement = this.rootElement.querySelector(this.selectors.newTaskButton)
        this.overlayElement = document.querySelector(this.selectors.overlay)
        this.newTaskFormElement = this.overlayElement.querySelector(this.selectors.newTaskForm)
        this.newTaskInputElement = this.overlayElement.querySelector(this.selectors.newTaskInput)
        this.newTaskFormCancelButtonElement = this.overlayElement.querySelector(this.selectors.newTaskFormCancelButton)
        this.state = this.getProxyState({
            items: this.getItemsFromLocalStorage(),
            filteredStatus: '',
            filteredItems: null,
            searchQuery: '',
        })
        this.editingTaskId = null
        this.render()
        this.bindEvents()
    }

    getItemsFromLocalStorage() {
        const rawData = localStorage.getItem(this.localStorageKey)

        if (!rawData) {
            return []
        }

        try {
            const parsedData = JSON.parse(rawData)

            return Array.isArray(parsedData) ? parsedData : []
        } catch {
            console.error('Todo items parsed error')

            return []
        }
    }

    saveItemsToLocalStorage() {
        localStorage.setItem(
            this.localStorageKey,
            JSON.stringify(this.state.items)
        )
    }

    escapeHTML(text) {
        const divElement = document.createElement('div')
        divElement.textContent = text

        return divElement.innerHTML
    }

    render() {
        const items = this.state.filteredItems ?? this.state.items

        this.listElement.innerHTML = items.map(({ id, title, isChecked }) => `
            <li class="todo__item todo-item" data-js-todo-item>
                <input id="${id}" type="checkbox" class="todo-item__checkbox" ${isChecked ? 'checked' : ''} data-js-todo-item-checkbox>
                <label for="${id}" class="todo-item__label" data-js-todo-item-label>${this.escapeHTML(title)}</label>
                <div class="todo-item__actions">
                    <button class="todo-item__edit-button" type="button" aria-label="Edit task" title="Edit task"
                        data-js-todo-item-edit-button>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12.0091 9.32736L14.4018 6.93468L14.4025 6.93398C14.7324 6.60414 14.8974 6.43916 14.9592 6.24885C15.0136 6.08133 15.0136 5.90088 14.9592 5.73337C14.8973 5.54292 14.7321 5.37769 14.4018 5.04738L12.9506 3.59625C12.6217 3.26735 12.4569 3.10257 12.2669 3.04082C12.0993 2.98639 11.9189 2.98639 11.7514 3.04082C11.5612 3.10261 11.3962 3.26759 11.0669 3.59695L11.0654 3.59837L8.67272 5.99106L2 12.6637V16H5.33636L12.0091 9.32736ZM8.67272 5.99106L12.0091 9.32736"
                                stroke="#CDCDCD" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    <button class="todo-item__delete-button" type="button" aria-label="Delete" title="Delete"
                        data-js-todo-item-delete-button>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M3.87414 7.61505C3.80712 6.74386 4.49595 6 5.36971 6H12.63C13.5039 6 14.1927 6.74385 14.1257 7.61505L13.6064 14.365C13.5463 15.1465 12.8946 15.75 12.1108 15.75H5.88894C5.10514 15.75 4.45348 15.1465 4.39336 14.365L3.87414 7.61505Z"
                                stroke="#CDCDCD" />
                            <path d="M14.625 3.75H3.375" stroke="#CDCDCD" stroke-linecap="round" />
                            <path
                                d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z"
                                stroke="#CDCDCD" />
                            <path d="M10.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round" />
                            <path d="M7.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>
            </li>
        `).join('')

        const isEmpty = this.state.items.length === 0 || this.state.filteredItems?.length === 0

        this.emptyMessageElement.classList.toggle(this.stateClasses.isVisible, isEmpty)
    }

    filter() {
        const queryFormatted = this.state.searchQuery.toLowerCase()

        this.state.filteredItems = this.state.items.filter(({ title }) => {
            const titleFormatted = title.toLowerCase()

            return titleFormatted.includes(queryFormatted)
        })
    }

    resetFilter() {
        this.state.filteredItems = null
        this.state.searchQuery = ''
    }

    addItem(title) {
        const newItem = {
            id: crypto?.randomUUID() ?? Date.now().toString(),
            title,
            isChecked: false,
        }
        this.state.items = [...this.state.items, newItem]
    }

    editItem(id, newTitle) {
        this.state.items = this.state.items.map((item) => {
            if (item.id === id) {
                return {
                    ...item,
                    title: newTitle,
                }
            }

            return item
        })

        this.editingTaskId = null
    }

    deleteItem(id) {
        this.state.items = this.state.items.filter((item) => item.id !== id)
    }

    toggleCheckedState(id) {
        this.state.items = this.state.items.map((item) => {
            if (item.id === id) {
                return {
                    ...item,
                    isChecked: !item.isChecked,
                }
            }

            return item
        })
    }

    onSearchTaskFormSubmit = (event) => {
        event.preventDefault()
    }

    onSearchTaskInputChange = () => {
        const value = this.searchTaskInputElement.value.trim()

        if (value.length > 0) {
            this.state.searchQuery = value
            this.filter()
        } else {
            this.resetFilter()
        }
    }

    onNewTaskFormClick = () => {
        this.overlayElement.showModal()
    }


    onNewTaskFormCancel = () => {
        this.overlayElement.close()
        this.editingTaskId = null
        this.newTaskInputElement.value = ''
    }

    onNewTaskFormSubmit = (event) => {
        event.preventDefault()

        const newTodoItemTitle = this.newTaskInputElement.value

        if (newTodoItemTitle.trim().length === 0) {
            this.newTaskInputElement.focus()
            return
        }

        if (this.editingTaskId === null) {
            this.addItem(newTodoItemTitle)
        } else {
            this.editItem(this.editingTaskId, newTodoItemTitle)
        }

        this.overlayElement.close()
        this.newTaskInputElement.value = ''
        this.editingTaskId = null
    }

    onChange = ({ target }) => {
        if (target.matches(this.selectors.itemCheckbox)) {
            this.toggleCheckedState(target.id)
        }
    }

    onDeleteClick = ({ target }) => {
        if (target.matches(this.selectors.itemDeleteButton)) {
            const itemElement = target.closest(this.selectors.item)
            const itemCheckboxElement = itemElement.querySelector(this.selectors.itemCheckbox)

            itemElement.classList.add(this.stateClasses.isDisappearing)

            setTimeout(() => {
                this.deleteItem(itemCheckboxElement.id)
            }, 400)
        }
    }

    onEditClick = ({ target }) => {
        if (target.matches(this.selectors.itemEditButton)) {
            const itemElement = target.closest(this.selectors.item)
            const itemCheckboxElement = itemElement.querySelector(this.selectors.itemCheckbox)
            const oldItemTitle = itemElement.querySelector(this.selectors.itemLabel)

            this.editingTaskId = itemCheckboxElement.id

            this.newTaskInputElement.value = oldItemTitle.textContent
            this.overlayElement.showModal()
        }
    }

    bindEvents() {
        this.searchTaskFormElement.addEventListener('submit', this.onSearchTaskFormSubmit)
        this.searchTaskInputElement.addEventListener('input', this.onSearchTaskInputChange)
        this.newTaskButtonElement.addEventListener('click', this.onNewTaskFormClick)
        this.newTaskFormCancelButtonElement.addEventListener('click', this.onNewTaskFormCancel)
        this.newTaskFormElement.addEventListener('submit', this.onNewTaskFormSubmit)
        this.listElement.addEventListener('change', this.onChange)
        this.listElement.addEventListener('click', this.onDeleteClick)
        this.listElement.addEventListener('click', this.onEditClick)
    }
}

export default Todo