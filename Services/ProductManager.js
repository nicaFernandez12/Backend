const path = require('path');
const fs = require('fs').promises;

class ProductManager {
    constructor(actualPath) {
        this.products = [];
        this.path = actualPath;
        this.autoIncrementableId = 1;
        this.cargarProductos(); 
    }
    
    async cargarProductos() {
        //Este metodo carga el archivo de products
        try {
            const data = await fs.readFile(this.path, 'utf-8');

            if (data.trim() === '') {
                //Si el archivo está vacío se carga con arreglo vacio e id 1
                this.products = [];
                this.autoIncrementableId = 1;
            } else {
                this.products = JSON.parse(data);

                this.autoIncrementableId = this.products.reduce((maxId, producto) => {
                    return Math.max(maxId, producto.id);
                }, 0);
                this.autoIncrementableId++;
            }


        } catch (error) {
            throw error;
        }
    }

    //Añade un product a la lista
    async addProduct({ title, description, price, thumbnail, code, stock, status, category }) {
        await this.cargarProductos();

        if (!title || !description || !price || !thumbnail || !code || !stock || !status || !category) {
            //Verifica que esten todos los datos completos

            const error = new Error('Todos los campos son obligatorios');
            error.statusCode = 400;
            throw error;

        } else if (this.products.some(product => product.code === code)) {
            //Verifica que el producto no exista

            const error = new Error(`Ya existe un producto con el código ${code}`);
            error.statusCode = 409;
            throw error;
        } else {
            //Crea el producto y lo agrega a la lista
            const newProduct = {
                id: this.autoIncrementableId++,
                title,
                description,
                price,
                thumbnail,
                code,
                stock,
                status,
                category
            };

            this.products.push(newProduct);

            try {
                //Reescribe el archivo
                await fs.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf-8');
            } catch (fileError) {
                const error = new Error('Error al cargar el archivo');
                error.statusCode = 500;
                throw error;
            }

            return newProduct;
        }
    }

    //Obtiene toda la lista de productos
    async getProducts() {
        try {
            await this.cargarProductos();
            return this.products;
        } catch (error) {
            console.error('Error al obtener productos');
        }
    }

    //Obtiene un product especifico de la lista
    async getProductById(id) {
        await this.cargarProductos();

        let foundProduct = this.products.find((product) => product.id === id);

        if (!foundProduct) {
            //Verifica que el producto exista
            const error = new Error('El producto no existe');
            error.statusCode = 404;
            throw error;
        } else {
            return foundProduct;
        }
    }

    //Actualiza un producto específico de la lista
    async updateProduct(id, newProduct) {
        await this.cargarProductos();
        let foundIndex = this.products.findIndex((product) => product.id === id);

        if (foundIndex === -1) {
            //Verifica que el producto exista
            const error = new Error('El producto no existe');
            error.statusCode = 404;
            throw error;
        } else {
            //Lo modifica
            this.products[foundIndex] = { ...this.products[foundIndex], ...newProduct, id: this.products[foundIndex].id }

            try {
                //Reescribe el archivo
                await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
            } catch (fileError) {
                const error = new Error('Error al cargar el archivo');
                error.statusCode = 500;
                throw error;
            }

            return this.products[foundIndex];
        }
    }

    //Elimina un producto de la lista
    async deleteProduct(id) {
        await this.cargarProductos();
        let foundProduct = this.products.find((product) => product.id === id);

        if (!foundProduct) {
            //Verifica que exista
            const error = new Error('El producto no existe');
            error.statusCode = 404;
            throw error;
        } else {
            //Lo elimina de la lista
            const updatedProducts = this.products.filter(product => product.id !== foundProduct.id);

            try {
                //Reescribe el archivo
                await fs.writeFile(this.path, JSON.stringify(updatedProducts, null, 2));
            } catch (fileError) {
                const error = new Error('Error al cargar el archivo');
                error.statusCode = 500;
                throw error;
            }

            return foundProduct;
        }
    }
}

module.exports = ProductManager;
