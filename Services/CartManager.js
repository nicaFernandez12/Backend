const fs = require('fs').promises;

class CartManager {
    constructor(filePath) {
        this.path = filePath;
        this.carts = [];
        this.autoIncrementableId = 1;
        this.loadCarts();
    }

    //Carga el archivo de carts, de la misma manera que los products
    async loadCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');

            if (data.trim() === '') {
                //si esta vacío inicializa en arreglo vacío
                this.carts = [];
                this.autoIncrementableId = 1;

            } else {
                this.carts = JSON.parse(data);

                //Busca el id mas grande para seguir incrementando desde ahí
                this.autoIncrementableId = this.carts.reduce((maxId, carrito) => {
                    return Math.max(maxId, carrito.id);
                }, 0);
                this.autoIncrementableId++;
            }

        } catch (fileError) {
            const error = new Error('Error al cargar el archivo');
            error.statusCode = 500;
            throw error;
        }
    }

    //Crea un carrito con un arreglo vacío de productos
    async createCart() {
        try {
            await this.loadCarts();
            const newCart = {
                id: this.autoIncrementableId++,
                products: []
            }

            this.carts.push(newCart);

            await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf-8');

            return newCart;
        } catch (fileError) {
            const error = new Error('Error al crear el carrito');
            error.statusCode = 500;
            throw error;
        }
    }

    //Obtiene el arreglo de productos de un carrito específico
    async getCart(id) {
        await this.loadCarts();

        const foundCart = this.carts.find(cart => cart.id === id);

        if (!foundCart) {
            //Verifica que exista
            const error = new Error('El carrito no existe');
            error.statusCode = 404;
            throw error;
        } else {
            return foundCart.products;
        }
    }

    //Agrega un producto a un carrito correspondiente
    async addProductToCart(cid, pid) {
        await this.loadCarts();

        const foundCart = this.carts.find(cart => cart.id === cid);

        if (!foundCart) {
            //Verifica que el carrito exista
            const error = new Error('El carrito no existe');
            error.statusCode = 404;
            throw error;
        } else {
            const foundProduct = foundCart.products.find(product => product.id === pid);

            if (!foundProduct) {
                //Si el producto no existe lo agrega al arreglo
                foundCart.products.push({ id: pid, quantity: 1 });
            } else {
                //Si este existe incrementa su cantidad
                foundProduct.quantity++;
            }

            try {
                await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf-8');

            } catch (fileError) {
                const error = new Error('Error al cargar el archivo');
                error.statusCode = 500;
                throw error;
            }

            return foundCart
        }
    }
}

module.exports = CartManager;