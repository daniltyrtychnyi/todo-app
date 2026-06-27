class BaseComponent {
    constructor() {
        if (this.constructor === BaseComponent) {
            throw new Error('Нельзя вызвать метод constructor абстрактного класса BaseComponent')
        }
    }

    getProxyState(initialState) {
        return new Proxy(initialState, {
            get: (target, prop) => {
                return target[prop]
            },

            set: (target, prop, newValue) => {
                const oldValue = target[prop]

                target[prop] = newValue

                if (oldValue !== newValue) {
                    this.render()
                    this.saveItemsToLocalStorage()
                }

                return true
            },
        })
    }

    render() {
        throw new Error('Необходимо реализовать метод render!')
    }

    saveItemsToLocalStorage() {}
}

export default BaseComponent