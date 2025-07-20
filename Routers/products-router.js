const express = require('express');


module.exports = (productManager) => {
    const router = express.Router();

    //Metodo GET de todos los products
    router.get('/', async (req, res) => {
        try {
            const { limit, page, sort, category, code, stock, status, price, title, description } = req.query

            // Validaciones y conversiones
            const finalLimit = limit && !isNaN(Number.parseInt(limit)) ? Number.parseInt(limit) : 10
            const finalPage = page && !isNaN(Number.parseInt(page)) ? Number.parseInt(page) : 1
            const finalSort = typeof sort === "string" ? sort : undefined

            // Validar parámetros numéricos
            if ((limit && isNaN(limit)) || (page && isNaN(page)) || (stock && isNaN(stock)) || (price && isNaN(price))) {
                return res.status(400).json({
                    status: "error",
                    message: "Uno o más parámetros numéricos son inválidos.",
                })
            }

            // Construcción dinámica del objeto de búsqueda
            const query = {}
            if (category) query.category = category
            if (code) query.code = code
            if (stock) query.stock = Number.parseInt(stock)
            if (status !== undefined) query.status = status === "true"
            if (price) query.price = Number.parseFloat(price)
            if (title) query.title = title
            if (description) query.description = description

            const result = await productManager.getProducts(finalLimit, finalPage, finalSort, query)

            res.status(200).json({
                status: "success",
                payload: result.payload,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.prevLink,
                nextLink: result.nextLink,
            })

        } catch (error) {
            const statusCode = error.statusCode || 500;
            const errorMessage = error.message || 'Error interno inesperado'

            res.status(statusCode).send({
                message: errorMessage
            })
        }
    })

    //Metodo GET de un product específico
    router.get('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const product = await productManager.getProductById(id);
            res.status(200).json(product);

        } catch (error) {
            const statusCode = error.statusCode || 500;
            const errorMessage = error.message || 'Error interno inesperado'

            res.status(statusCode).send({
                message: errorMessage
            })
        }
    })

    //Metodo POST de un product
    router.post('/', async (req, res) => {
        try {
            const newProduct = req.body;
            const addedProduct = await productManager.addProduct(newProduct);

            const allProductsResult = await productManager.getProducts(50, 1);
            const allProducts = allProductsResult.payload;

            req.io.emit('productCreated', {
                product: addedProduct,
                allProducts,
                totalProducts: allProductsResult.totalProducts
            });

            res.status(201).send({
                message: 'Producto agregado con exito',
                product: addedProduct
            });

        } catch (error) {
            const statusCode = error.statusCode || 500;
            const errorMessage = error.message || 'Error interno inesperado'

            res.status(statusCode).send({
                message: errorMessage
            })
        }
    })

    //Metodo PUT de un product
    router.put('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const newProduct = req.body;

            const updatedProduct = await productManager.updateProduct(id, newProduct);

            const allProductsResult = await productManager.getProducts(50, 1);
            const allProducts = allProductsResult.payload;

            req.io.emit('productUpdated', {
                product: updatedProduct,
                allProducts,
                totalProducts: allProductsResult.totalProducts
            });

            res.status(200).send({
                message: 'Producto agregado con exito',
                product: updatedProduct
            });

        } catch (error) {
            const statusCode = error.statusCode || 500;
            const errorMessage = error.message || 'Error interno inesperado'

            res.status(statusCode).send({
                message: errorMessage
            })
        }
    })

    //Metodo DELETE de un product
    router.delete('/:id', async (req, res) => {
        try {
            const id = req.params.id;

            const deletedProduct = await productManager.deleteProduct(id);

            const allProductsResult = await productManager.getProducts(50, 1);
            const allProducts = allProductsResult.payload;

            req.io.emit('productDeleted', {
                product:deletedProduct,
                allProducts,
                totalProducts: allProductsResult.totalProducts
            });

            res.send({
                message: 'Producto eliminado con exito',
                product: deletedProduct
            })
        } catch (error) {
            const statusCode = error.statusCode || 500;
            const errorMessage = error.message || 'Error interno inesperado'

            res.status(statusCode).send({
                message: errorMessage
            })
        }
    })

    return router;
}