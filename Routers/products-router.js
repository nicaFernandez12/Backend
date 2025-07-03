const express = require('express');


module.exports = (productManager) => {
    const router = express.Router();

    //Metodo GET de todos los products
    router.get('/', async (req, res) => {
        try {
            const products = await productManager.getProducts();
            res.status(200).json(products);
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
            const id = Number(req.params.id);
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

            const allProducts = await productManager.getProducts();
            req.io.emit('productAdded', { product: newProduct, allProducts });

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
            const id = Number(req.params.id);
            const newProduct = req.body;

            const resultado = await productManager.updateProduct(id, newProduct);

            const allProducts = await productManager.getProducts();
            req.io.emit('productUpdated', { product: updatedProduct, allProducts });

            res.status(200).json(resultado);

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
            const id = Number(req.params.id);

            const resultado = await productManager.deleteProduct(id);

            const allProducts = await productManager.getProducts();
            req.io.emit('productDeleted', { product: deletedProduct, allProducts });

            res.send({
                message: 'Producto eliminado con exito',
                product: resultado
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