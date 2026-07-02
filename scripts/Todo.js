import BaseComponent from './BaseComponent.js'
import CustomSelect from './CustomSelect.js'

class Todo extends BaseComponent {
    selectors = {
        root: '[data-js-todo]',
        searchTaskForm: '[data-js-todo-search-task-form]',
        searchTaskInput: '[data-js-todo-search-task-input]',
        list: '[data-js-todo-list]',
        item: '[data-js-todo-item]',
        itemCheckbox: '[data-js-todo-item-checkbox]',
        itemLabel: '[data-js-todo-item-label]',
        itemEditButton: '[data-js-todo-item-edit-button]',
        itemDeleteButton: '[data-js-todo-item-delete-button]',
        emptyMessage: '[data-js-todo-empty-message]',
        newTaskButton: '[data-js-todo-new-task-button]',
        overlay: '[data-js-overlay]',
        newTaskForm: '[data-js-overlay-new-task-form]',
        newTaskInput: '[data-js-overlay-new-task-input]',
        newTaskCancelButton: '[data-js-overlay-new-task-cancel-button]',
        originalControl: '[data-js-todo-select-original-control]',
    }

    stateClasses = {
        isVisible: 'is-visible',
        isDisappearing: 'is-disappearing',
    }

    localStorageKey = 'tasks'

    constructor() {
        super()
        this.rootElement = document.querySelector(this.selectors.root)
        this.searchTaskFormElement = this.rootElement.querySelector(this.selectors.searchTaskForm)
        this.searchTaskInputElement = this.rootElement.querySelector(this.selectors.searchTaskInput)
        this.originalControlElement = this.rootElement.querySelector(this.selectors.originalControl)
        this.listElement = this.rootElement.querySelector(this.selectors.list)
        this.emptyMessageElement = this.rootElement.querySelector(this.selectors.emptyMessage)
        this.newTaskButtonElement = this.rootElement.querySelector(this.selectors.newTaskButton)
        this.overlayElement = document.querySelector(this.selectors.overlay)
        this.newTaskFormElement = this.overlayElement.querySelector(this.selectors.newTaskForm)
        this.newTaskInputElement = this.overlayElement.querySelector(this.selectors.newTaskInput)
        this.state = this.getProxyState({
            tasks: this.getTasksFromLocalStorage(),
            searchQuery: '',
            filterStatus: '',
            editingTaskId: '',
        })
        this.updateUI()
        this.bindEvents()
    }

    getTasksFromLocalStorage() {
        const rawData = localStorage.getItem(this.localStorageKey)

        if (!rawData) {
            return []
        }

        try {
            const parsedData = JSON.parse(rawData)

            return Array.isArray(parsedData) ? parsedData : []
        } catch {
            console.error('Todo tasks parse error!')

            return []
        }
    }

    saveTasksToLocalStorage() {
        localStorage.setItem(
            this.localStorageKey,
            JSON.stringify(this.state.tasks)
        )
    }

    escapeHtml(input) {
        const divElement = document.createElement('div')
        divElement.textContent = input

        return divElement.innerHTML
    }

    addTask(title) {
        const newTask = {
            id: crypto?.randomUUID() ?? Date.now().toString(),
            title,
            isChecked: false,
        }
        this.state.tasks = [...this.state.tasks, newTask]
        this.saveTasksToLocalStorage()
    }

    editTask(newTitle) {
        this.state.tasks = this.state.tasks.map((task) => {
            if (task.id === this.state.editingTaskId) {
                return {
                    ...task,
                    title: newTitle,
                }
            }

            return task
        })

        this.state.editingTaskId = null
        this.saveTasksToLocalStorage()
    }

    deleteTask(id) {
        this.state.tasks = this.state.tasks.filter((task) => task.id !== id)
        this.saveTasksToLocalStorage()
    }

    toggleCheckedState(id) {
        this.state.tasks = this.state.tasks.map((task) => {
            if (task.id === id) {
                return {
                    ...task,
                    isChecked: !task.isChecked,
                }
            }

            return task
        })
        this.saveTasksToLocalStorage()
    }

    updateUI() {
        let tasks = this.state.tasks

        if (this.state.searchQuery.length > 0) {
            const queryFormatted = this.state.searchQuery.toLowerCase()

            tasks = tasks.filter(({ title }) => {
                const titleFormatted = title.toLowerCase()

                return titleFormatted.includes(queryFormatted)
            })
        }

        if (this.state.filterStatus === 'Complete') {
            tasks = tasks.filter(({ isChecked }) => isChecked === true)
        } else if (this.state.filterStatus === 'Incomplete') {
            tasks = tasks.filter(({ isChecked }) => isChecked === false)
        }

        this.listElement.innerHTML = tasks.map(({ id, title, isChecked }) => `
        <li class="todo__item todo-item" data-js-todo-item>
            <input id="${id}" class="todo-item__checkbox" type="checkbox" ${isChecked ? 'checked' : ''} data-js-todo-item-checkbox>
            <label for="${id}" class="todo-item__label" data-js-todo-item-label>${this.escapeHtml(title)}</label>
            <div class="todo-item__actions" data-js-todo-item-actions>
                <button class="todo-item__edit-button" type="button" aria-label="Edit task" title="Edit task" data-js-todo-item-edit-button>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.0091 9.32736L14.4018 6.93468L14.4025 6.93398C14.7324 6.60414 14.8974 6.43916 14.9592 6.24885C15.0136 6.08133 15.0136 5.90088 14.9592 5.73337C14.8973 5.54292 14.7321 5.37769 14.4018 5.04738L12.9506 3.59625C12.6217 3.26735 12.4569 3.10257 12.2669 3.04082C12.0993 2.98639 11.9189 2.98639 11.7514 3.04082C11.5612 3.10261 11.3962 3.26759 11.0669 3.59695L11.0654 3.59837L8.67272 5.99106L2 12.6637V16H5.33636L12.0091 9.32736ZM8.67272 5.99106L12.0091 9.32736" stroke="#CDCDCD" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="todo-item__delete-button" type="button" aria-label="Delete button" title="Delete button" data-js-todo-item-delete-button>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.87414 7.61505C3.80712 6.74386 4.49595 6 5.36971 6H12.63C13.5039 6 14.1927 6.74385 14.1257 7.61505L13.6064 14.365C13.5463 15.1465 12.8946 15.75 12.1108 15.75H5.88894C5.10514 15.75 4.45348 15.1465 4.39336 14.365L3.87414 7.61505Z" stroke="#CDCDCD"/>
                        <path d="M14.625 3.75H3.375" stroke="#CDCDCD" stroke-linecap="round"/>
                        <path d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z" stroke="#CDCDCD"/>
                        <path d="M10.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
                        <path d="M7.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        </li>
        `).join('')

        this.emptyMessageElement.classList.toggle(
            this.stateClasses.isVisible,
            tasks.length === 0
        )
    }

    openDialog() {
        this.overlayElement.showModal()
    }

    resetInputAndCloseDialog() {
        this.newTaskInputElement.value = ''
        this.state.editingTaskId = ''
        this.overlayElement.close()
    }

    onSearchTaskFormSubmit = (event) => {
        event.preventDefault()
    }

    onSearchTaskInputChange = () => {
        this.state.searchQuery = this.searchTaskInputElement.value.trim()
    }

    onOriginalControlChange = () => {
        this.state.filterStatus = this.originalControlElement.value
    }

    onNewTaskButtonClick = () => {
        this.openDialog()
    }

    onNewTaskFormClick = ({ target }) => {
        if (target.matches(this.selectors.newTaskCancelButton)) {
            this.resetInputAndCloseDialog()
        }
    }

    onNewTaskFormSubmit = (event) => {
        event.preventDefault()

        const newTodoTaskTitle = this.newTaskInputElement.value.trim()

        if (newTodoTaskTitle.length === 0) {
            this.newTaskInputElement.focus()

            return
        }

        if (this.state.editingTaskId !== '') {
            this.editTask(newTodoTaskTitle)
        } else {
            this.addTask(newTodoTaskTitle)
        }

        this.resetInputAndCloseDialog()
    }

    onClick = ({ target }) => {
        const itemElement = target.closest(this.selectors.item)

        if (!itemElement) {
            return
        }

        const itemCheckboxElement = itemElement.querySelector(this.selectors.itemCheckbox)
        const currentTaskId = itemCheckboxElement.id

        if (target.matches(this.selectors.itemDeleteButton)) {
            itemElement.classList.add(this.stateClasses.isDisappearing)

            setTimeout(() => {
                this.deleteTask(currentTaskId)
            }, 400)

            return
        }

        if (target.matches(this.selectors.itemEditButton)) {
            const itemLabelElement = itemElement.querySelector(this.selectors.itemLabel)

            this.openDialog()
            this.state.editingTaskId = currentTaskId
            this.newTaskInputElement.value = itemLabelElement.textContent
        }
    }

    onChange = ({ target }) => {
        if (target.matches(this.selectors.itemCheckbox)) {
            this.toggleCheckedState(target.id)
        }
    }

    bindEvents() {
        this.searchTaskFormElement.addEventListener('submit', this.onSearchTaskFormSubmit)
        this.searchTaskInputElement.addEventListener('input', this.onSearchTaskInputChange)
        this.originalControlElement.addEventListener('change', this.onOriginalControlChange)
        this.newTaskButtonElement.addEventListener('click', this.onNewTaskButtonClick)
        this.newTaskFormElement.addEventListener('click', this.onNewTaskFormClick)
        this.newTaskFormElement.addEventListener('submit', this.onNewTaskFormSubmit)
        this.listElement.addEventListener('click', this.onClick)
        this.listElement.addEventListener('change', this.onChange)
    }
}

export default Todo