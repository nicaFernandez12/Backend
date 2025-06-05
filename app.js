const express = require('express');

const ProductRouter = require('./Routers/products-router');
const CartRouter = require('./Routers/carts-router');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use('/api/products', ProductRouter);
app.use('/api/carts', CartRouter);

//Creo el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});
