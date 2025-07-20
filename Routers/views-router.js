const express = require('express');

// Exportar una función que recibe productManager como parámetro
module.exports = (productManager) => {
    const router = express.Router();

    router.get("/", async (req, res) => {
        try {
            // 1. Leer TODOS los parámetros de la consulta (query)
            const { limit, page, sort, category, stock } = req.query;

            // 2. Establecer valores por defecto y validar
            const finalLimit = Number.parseInt(limit) || 6;
            const finalPage = Number.parseInt(page) || 1;
            const finalSort = sort === 'asc' || sort === 'desc' ? sort : undefined;

            if (finalPage < 1 || finalLimit < 1) {
                return res.status(400).send("Parámetros de página o límite inválidos.");
            }

            // 3. Construir el objeto de consulta (query) dinámicamente
            const query = {};
            if (category) {
                // Busca por categoría exacta (insensible a mayúsculas/minúsculas)
                query.category = { $regex: new RegExp(`^${category}$`, 'i') };
            }
            if (stock === '1') {
                // '1' significa "disponible", por lo tanto, stock > 0
                query.stock = { $gt: 0 };
            } else if (stock === '0') {
                // '0' significa "agotado", por lo tanto, stock = 0
                query.stock = 0;
            }
            // Si 'stock' no es '1' ni '0', no se añade al filtro.

            // 4. Llamar al productManager con todos los parámetros
            const result = await productManager.getProducts(finalLimit, finalPage, finalSort, query);

            // 5. Construir los enlaces de paginación CON los filtros actuales
            const buildLink = (page) => {
                const newQuery = new URLSearchParams(req.query);
                newQuery.set('page', page);
                return `/?${newQuery.toString()}`;
            };

            const prevLink = result.hasPrevPage ? buildLink(result.prevPage) : null;
            const nextLink = result.hasNextPage ? buildLink(result.nextPage) : null;

            // 6. Preparar el objeto de datos para la vista (debe coincidir con el .handlebars)
            const viewData = {
                // La plantilla itera sobre 'payload'
                payload: result.payload.map(doc => doc.toObject()),
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: prevLink,
                nextLink: nextLink,
                // Datos para mantener el estado del formulario de búsqueda
                currentCategory: category,
                currentStock: stock,
                currentSort: sort
            };

            // 7. Renderizar la vista con los datos
            res.render("home", viewData); // Asegúrate que el nombre "products" coincida con tu archivo .handlebars

        } catch (error) {
            console.error("Error al obtener productos para la vista:", error);
            res.status(500).send("Error interno del servidor");
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