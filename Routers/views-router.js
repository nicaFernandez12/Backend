const express = require('express');

// Exportar una función que recibe productManager como parámetro
module.exports = (productManager) => {
    const router = express.Router();

    // Ruta para la vista home
    router.get('/', async (req, res) => {
        try {
            const products = await productManager.getProducts();
            res.render('home', { 
                title: 'Lista de Productos',
                products: products,
                productsJson: JSON.stringify(products),
                hasProducts: products.length > 0
            });
        } catch (error) {
            console.error("Error en home:", error);
            res.render('home', { 
                title: 'Lista de Productos',
                error: error.message,
                products: [],
                productsJson: '[]',
                hasProducts: false
            });
        }
    });

    // Ruta para la vista de productos en tiempo real
    router.get('/realtimeproducts', async (req, res) => {
        try {
            const products = await productManager.getProducts();
            res.render('realTimeProducts', { 
                title: 'Productos en Tiempo Real',
                products: products,
                hasProducts: products.length > 0
            });
        } catch (error) {
            console.error("Error en realTimeProducts:", error);
            res.render('realTimeProducts', { 
                title: 'Productos en Tiempo Real',
                error: error.message,
                products: [],
                hasProducts: false
            });
        }
    });

    return router;
};