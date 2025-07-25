const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://nicanorfg80:GGkNQrKi74c95HP5@cluster0.uk7rclc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("BD conectada correctamente")
    })
    .catch((error) => {
        console.error("Error en la conexión", error)
    }
    )

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Permite todos los orígenes (ajusta en producción)
        methods: ["GET", "POST"]
    }
});

// Importar ProductManager
const ProductManager = require('./Services/ProductManager');

// Crear UNA SOLA instancia de ProductManager
const filePath = path.join(__dirname, 'Data/productos.json');
const productManager = new ProductManager(filePath);

const ProductRouter = require('./Routers/products-router')(productManager);
const CartRouter = require('./Routers/carts-router');
const ViewsRouter = require('./Routers/views-router')(productManager);

const PORT = process.env.PORT || 8080;

app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        json: function (context) {
            return JSON.stringify(context);
        },
        eq: function (a, b, options) {
            if (arguments.length < 3) {
                throw new Error('Helper eq necesita exactamente 2 argumentos');
            }
            return a === b;
        },
        ne: function (a, b) {
            return a !== b;
        },
        gt: function (a, b) {
            return a > b;
        },
        lt: function (a, b) {
            return a < b;
        },
        substring: function (str, start, end) {
            // Verificaciones de seguridad
            if (str === null || str === undefined) {
                return ''; // Retorna cadena vacía si el valor es nulo/undefined
            }

            // Asegurarnos que es string (por si viene un número u otro tipo)
            str = String(str);

            // Convertir parámetros a números enteros
            start = parseInt(start) || 0;
            end = parseInt(end) || str.length;

            // Ajustar los valores para que estén dentro de los límites
            start = Math.max(0, start);
            end = Math.min(Math.max(start, end), str.length);

            return str.substring(start, end);;
        }
    }
}));


app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', ViewsRouter);
app.use('/api/products', ProductRouter);
app.use('/api/carts', CartRouter);

app.use((req, res, next) => {
    req.io = io;
    next();
});


// WEBSOCKET CONNECTIONS
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Enviar lista de productos al cliente recién conectado
    socket.on('requestProducts', async () => {
        try {
            const productsData = await productManager.getProducts(50, 1);
            const products = productsData.payload;
            socket.emit('updateProducts', products);
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    // Manejar creación de productos desde WebSocket
    socket.on('createProduct', async (productData) => {
        try {
            const newProduct = await productManager.addProduct(productData);
            const productsData = await productManager.getProducts(50, 1);
            const allProducts = productsData.payload

            // Emitir a todos los clientes conectados
            io.emit('productAdded', { product: newProduct, allProducts });

            socket.emit('productCreated', {
                success: true,
                product: newProduct,
                message: 'Producto creado exitosamente'
            });
        } catch (error) {
            socket.emit('productCreated', {
                success: false,
                message: error.message
            });
        }
    });

    // Manejar eliminación de productos desde WebSocket
    socket.on('deleteProduct', async (productId) => {
        try {
            const deletedProduct = await productManager.deleteProduct(productId);
            const productsData = await productManager.getProducts(50, 1);
            const allProducts = productsData.payload

            // Emitir a todos los clientes conectados
            io.emit('productDeleted', { product: deletedProduct, allProducts });

            socket.emit('productDeleted', {
                success: true,
                product: deletedProduct,
                allProducts: allProducts,
                message: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

//Creo el servidor
httpServer.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});
