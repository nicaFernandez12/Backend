const express = require('express');
const path = require('path');
const router = express.Router();
const CartManager = require('../Services/CartManager');

const filePath = path.join(__dirname, '../Data/carts.json');

const cartManager = new CartManager(filePath);

router.get('/', async (req, res) => {
    try {
        const carts = await cartManager.getProducts();
        res.status(200).json(carts);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Error interno inesperado'

        res.status(statusCode).send({
            message: errorMessage
        })
    }
})

//Metodo GET de productos de un cart
router.get('/:cid', async (req, res) => {
    try {
        const id = req.params.cid;

        const products = await cartManager.getCart(id);

        res.status(200).json(products);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Error interno inesperado'

        res.status(statusCode).send({
            message: errorMessage
        })
    }
})

//Metodo POST de carts
router.post('/', async (req, res) => {
    try {
        const { products } = req.body

        const productsArray = products || [];

        const newCart = await cartManager.createCart(productsArray);

        res.status(201).json(newCart);

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Error interno inesperado'

        res.status(statusCode).send({
            message: errorMessage
        })
    }
})


//Metodo POST de producto dentro de un cart
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const cart = await cartManager.addProductToCart(cid, pid);

        res.status(201).json(cart);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Error interno inesperado'

        res.status(statusCode).send({
            message: errorMessage
        })
    }
})

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;

        const cartUpdated = await cartManager.removeProductFromCart(cid, pid);

        res.status(200).send({
            message: "Producto eliminado con éxito del carrito",
            updatedCart: cartUpdated
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Error interno inesperado'

        res.status(statusCode).send({
            message: errorMessage
        })
    }
})

router.put('/:cid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const { products } = req.body;

        const cartUpdated = await cartManager.updateProductsFromCart(cid, products);

        res.status(200).send({
            message: "Productos modificados con éxito en el carrito",
            updatedCart: cartUpdated
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Error interno inesperado'

        res.status(statusCode).send({
            message: errorMessage
        })
    }
})

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const { quantity } = req.body;

        const cartUpdated = await cartManager.updateProductQuantity(cid, pid, quantity);

        res.status(200).send({
            message: "Cantidad de producto modificada con éxito en el carrito",
            updatedCart: cartUpdated
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Error interno inesperado'

        res.status(statusCode).send({
            message: errorMessage
        })
    }
})

router.delete('/:cid/products', async (req, res) => {
    try {
        const cid = req.params.cid;

        const cartUpdated = await cartManager.emptyCart(cid);

        res.status(200).send({
            message: "Carrito vaciado con exito",
            updatedCart: cartUpdated
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Error interno inesperado'

        res.status(statusCode).send({
            message: errorMessage
        })
    }
})

router.delete('/:cid', async (req, res) => {
    try {
        const cid = req.params.cid;

        const cartUpdated = await cartManager.deleteCart(cid);

        res.status(200).send({
            message: "Carrito eliminado con exito",
            updatedCart: cartUpdated
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Error interno inesperado'

        res.status(statusCode).send({
            message: errorMessage
        })
    }
})

module.exports = router;