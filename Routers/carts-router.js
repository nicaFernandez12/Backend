const express = require('express');
const path = require('path');
const router = express.Router();
const CartManager = require('../Services/CartManager');

const filePath = path.join(__dirname, '../Data/carts.json');

const cartManager = new CartManager(filePath);

//Metodo POST de carts
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        
        res.status(201).json(newCart);

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
        const id = Number(req.params.cid);

        const products = await cartManager.getCart(id);

        res.status(200).json(products);
    } catch(error){
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Error interno inesperado'

        res.status(statusCode).send({
            message: errorMessage
        })
    }
})

//Metodo POST de producto dentro de un cart
router.post('/:cid/product/:pid', async (req,res) => {
    try {
        const cid = Number(req.params.cid);
        const pid = Number(req.params.pid);
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

module.exports = router;