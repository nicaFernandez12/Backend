const fs = require('fs').promises;
const mongoose = require('mongoose');
const CartSchema = require('../Models/CartSchema')

class CartManager {
    constructor() {}

    async getCarts() {
        const carts = await CartSchema.find();
        return carts;
    }

    //Crea un carrito con un arreglo vacío de productos
    async createCart(products) {
        const newCart = new CartSchema({ products: products });
        const saveCart = await newCart.save();

        return saveCart;
    }

    async deleteCart(cid) {
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            //Verifica que el id sea válido
            const error = new Error('El id del producto es inválido');
            error.statusCode = 400;
            throw error;
        }

        const deletedCart = await CartSchema.findByIdAndDelete(cid);

        if (!deletedCart) {
            //Verifica que exista
            const error = new Error('El carrito no existe');
            error.statusCode = 404;
            throw error;
        }

        return deletedCart;
    }

    async emptyCart(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            //Verifica que el id sea válido
            const error = new Error('El id del producto es inválido');
            error.statusCode = 400;
            throw error;
        }

        const foundCart = await CartSchema.findById(id);

        if (!foundCart) {
            //Verifica que exista
            const error = new Error('El carrito no existe');
            error.statusCode = 404;
            throw error;
        }

        //Vacia el carrito
        foundCart.products = [];

        const emptiedCart = await foundCart.save();

        return emptiedCart;
    }

    //Obtiene el arreglo de productos de un carrito específico
    async getCart(cid) {
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            //Verifica que el id sea válido
            const error = new Error('El id del producto es inválido');
            error.statusCode = 400;
            throw error;
        }

        const foundCart = await CartSchema.findById(cid).populate("products.productId");

        if (!foundCart) {
            //Verifica que exista
            const error = new Error('El carrito no existe');
            error.statusCode = 404;
            throw error;
        }

        return foundCart;
    }

    //Agrega un producto a un carrito correspondiente
    async addProductToCart(cid, pid) {
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            //Verifica que el id sea válido
            const error = new Error('El id del carrito es inválido');
            error.statusCode = 400;
            throw error;
        }

        if (!mongoose.Types.ObjectId.isValid(pid)) {
            //Verifica que el id sea válido
            const error = new Error('El id del producto es inválido');
            error.statusCode = 400;
            throw error;
        }

        const foundCart = await CartSchema.findById(cid);

        if (!foundCart) {
            //Verifica que el carrito exista
            const error = new Error('El carrito no existe');
            error.statusCode = 404;
            throw error;
        }

        const foundProduct = foundCart.products.findIndex(item => item.productId.toString() === pid);

        if (foundProduct === -1) {
            //Si el producto no existe lo agrega al arreglo
            foundCart.products.push({ productId: pid, quantity: 1 });
        } else {
            //Si este existe incrementa su cantidad
            foundCart.products[foundProduct].quantity++;
        }

        const updatedCart = await foundCart.save();

        return updatedCart
    }

    async removeProductFromCart(cid, pid) {
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            //Verifica que el id sea válido
            const error = new Error('El id del carrito es inválido');
            error.statusCode = 400;
            throw error;
        }

        if (!mongoose.Types.ObjectId.isValid(pid)) {
            //Verifica que el id sea válido
            const error = new Error('El id del producto es inválido');
            error.statusCode = 400;
            throw error;
        }

        const foundCart = await CartSchema.findByIdAndUpdate(
            cid,
            { $pull: { products: { productId: pid } } },
            { new: true }
        );

        if (!foundCart) {
            //Verifica que exista
            const error = new Error('El carrito no existe');
            error.statusCode = 404;
            throw error;
        }

        return foundCart;
    }

    async updateProductsFromCart(cid, newProducts) {
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            //Verifica que el id sea válido
            const error = new Error('El id del carrito es inválido');
            error.statusCode = 400;
            throw error;
        }

        for (const product of newProducts) {
            if (!mongoose.Types.ObjectId.isValid(product.productId)) {
                //Verifica que el id sea válido
                const error = new Error('El id del un producto es inválido');
                error.statusCode = 400;
                throw error;
            }
            if (product.quantity || typeof product.quantity !== "number" || product.quantity <= 0) {
                const error = new Error('Un producto posee cantidades inválidas');
                error.statusCode = 400;
                throw error;
            }
        }

        const updatedCart = await CartSchema.findByIdAndUpdate(
            cid,
            { products: newProducts },
            { new: true, runValidators: true }
        )

        if (!updatedCart) {
            //Verifica que exista
            const error = new Error('El carrito no existe');
            error.statusCode = 404;
            throw error;
        }

        return updatedCart;
    }

    async updateProductQuantity(cid, pid, newQuantity) {
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            //Verifica que el id sea válido
            const error = new Error('El id del carrito es inválido');
            error.statusCode = 400;
            throw error;
        }

        if (!mongoose.Types.ObjectId.isValid(pid)) {
            //Verifica que el id sea válido
            const error = new Error('El id del producto es inválido');
            error.statusCode = 400;
            throw error;
        }

        if (typeof newQuantity !== "number" || newQuantity <= 0) {
            const error = new Error('La cantidad es inválida');
            error.statusCode = 400;
            throw error;
        }

        const foundCart = await CartSchema.findById(cid);

        if (!foundCart) {
            //Verifica que exista
            const error = new Error('El carrito no existe');
            error.statusCode = 404;
            throw error;
        }

        const foundProduct = foundCart.products.findIndex((item) => item.productId.toString() === pid);

        if (foundProduct === -1) {
            const error = new Error('El producto no existe en el carrito');
            error.statusCode = 404;
            throw error;
        }

        foundCart.products[foundProduct] = newQuantity;

        const updatedCart = foundCart.save();

        return updatedCart;
    }
}

module.exports = CartManager;