class BaseComponent {
    constructor() {
        if (this.constructor === BaseComponent) {
            throw new Error('Невозможно вызвать метод constructor абстрактного класса BaseComponent!')
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
                    this.updateUI()
                }

                return true
            }
        })
    }

    updateUI() {
        throw new Error('Необходимо создать метод updateUI!')
    }
}

export default BaseComponent