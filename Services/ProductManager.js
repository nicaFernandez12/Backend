const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const ProductsScheme = require('../Models/ProductSchema');

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
    async addProduct({ title, description, price, thumbnails, code, stock, status, category }) {
        await this.cargarProductos();

        if (!title || !description || !price || !thumbnails || !code || !stock || !status || !category) {
            //Verifica que esten todos los datos completos

            const error = new Error('Todos los campos son obligatorios');
            error.statusCode = 400;
            throw error;

        } else {
            const existingProduct = await ProductsScheme.findOne({ code: code })

            //Verifica que el producto no exista
            if (existingProduct) {
                const error = new Error(`Ya existe un producto con el código ${code}`);
                error.statusCode = 409;
                throw error;
            }

            //Crea el producto y lo agrega a la lista
            const productData = {
                title,
                description,
                price,
                thumbnails,
                code,
                stock,
                status,
                category
            };

            const newProduct = new ProductsScheme(productData);
            const saveProducts = await newProduct.save();

            /* this.products.push(newProduct);

            try {
                //Reescribe el archivo
                await fs.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf-8');
            } catch (fileError) {
                const error = new Error('Error al cargar el archivo');
                error.statusCode = 500;
                throw error;
            }
 */
            return newProduct;
        }
    }

    //Obtiene toda la lista de productos
    async getProducts(limit = 10, page = 1, sort, query) {
        try {
            const dbQuery = {}
            const sortOptions = {}

            // Construir query de búsqueda
            if (query) {
                const allowedFields = ["category", "code", "stock", "status", "price", "title", "description"]

                for (const field of allowedFields) {
                    if (query[field] !== undefined) {
                        if (typeof query[field] === "string") {
                            dbQuery[field] = { $regex: query[field], $options: "i" }
                        } else {
                            dbQuery[field] = query[field]
                        }
                    }
                }
            }

            // Procesamiento de ordenamiento
            if (sort) {
                const [field, order] = sort.split(":")
                if (field) {
                    sortOptions[field] = order === "desc" ? -1 : 1
                }
            }

            // Calcular skip para paginación
            const skip = (page - 1) * limit

            // Obtener total de documentos que coinciden con la query
            const totalDocs = await ProductsScheme.countDocuments(dbQuery)

            // Calcular información de paginación
            const totalPages = Math.ceil(totalDocs / limit)
            const hasPrevPage = page > 1
            const hasNextPage = page < totalPages
            const prevPage = hasPrevPage ? page - 1 : null
            const nextPage = hasNextPage ? page + 1 : null

            // Construir la consulta
            let productsQuery = ProductsScheme.find(dbQuery)

            if (Object.keys(sortOptions).length > 0) {
                productsQuery = productsQuery.sort(sortOptions)
            }

            productsQuery = productsQuery.limit(limit).skip(skip)

            const products = await productsQuery.exec()

            // Retornar objeto con formato requerido
            return {
                status: "success",
                payload: products,
                totalPages,
                prevPage,
                nextPage,
                page,
                hasPrevPage,
                hasNextPage,
                prevLink: hasPrevPage ? `/api/products?page=${prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ""}` : null,
                nextLink: hasNextPage ? `/api/products?page=${nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ""}` : null,
                totalDocs,
            }
        } catch (error) {
            console.error("Error al obtener productos:", error.message)
            return {
                status: "error",
                payload: [],
                totalPages: 0,
                prevPage: null,
                nextPage: null,
                page: 1,
                hasPrevPage: false,
                hasNextPage: false,
                prevLink: null,
                nextLink: null,
                totalDocs: 0,
                error: error.message,
            }
        }
    }

    //Obtiene un product especifico de la lista
    async getProductById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            //Verifica que el id sea válido
            const error = new Error('El id del producto es inválido');
            error.statusCode = 500;
            throw error;
        }

        const foundProduct = await ProductsScheme.findById(id);

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
    async updateProduct(id, newProductData) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            //Verifica que el id sea válido
            const error = new Error('El id del producto es inválido');
            error.statusCode = 400;
            throw error;
        }

        const updatedProduct = await ProductsScheme.findByIdAndUpdate(
            id,
            newProductData,
            { new: true }
        );

        if (!updatedProduct) {
            //Verifica que el producto exista
            const error = new Error('El producto no existe');
            error.statusCode = 404;
            throw error;
        }

        return updatedProduct;
    }

    //Elimina un producto de la lista
    async deleteProduct(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            //Verifica que el id sea válido
            const error = new Error('El id del producto es inválido');
            error.statusCode = 500;
            throw error;
        }

        let deletedProduct = ProductsScheme.findByIdAndDelete(id);

        if (!deletedProduct) {
            //Verifica que exista
            const error = new Error('El producto no existe');
            error.statusCode = 404;
            throw error;
        }

        return deletedProduct;
    }

    async getDistinctCategories() {
    try {
        // Utilizamos distinct para obtener valores únicos del campo 'category'
        const categories = await ProductsScheme.distinct('category');
        
        // Filtramos posibles valores nulos/undefined y ordenamos alfabéticamente
        return categories
            .filter(category => category && typeof category === 'string')
            .sort((a, b) => a.localeCompare(b));
            
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        return []; // Retornamos array vacío en caso de error
    }
}
}

module.exports = ProductManager;
