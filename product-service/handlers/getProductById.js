'use strict';
import { getDBClient } from '../utils/db-client';

export const getProductById = async (event) => {
    console.log('[Get Product By ID lambda] incoming request, event:', event);

    let client;
    let product = null;

    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };

    try {
        // For testing purpose only
        const error = event?.queryStringParameters?.error;
        if (error && Boolean(error)) throw new Error('Test 500 error');

        const id = event.pathParameters.id;
        client = await getDBClient();

        const { rows } = await client.query(`
            select products.id, products.title, products.description, products.price, products.image, stocks.count  from products
            inner join stocks on products.id=stocks.product_id
            where products.id='${id}';
        `);
        product = rows[0];
    } catch (err) {
        console.error('error', err);

        response.statusCode = 500;
        response.body = JSON.stringify({
            message: 'Internal error',
        });

        return response;
    } finally {
        if (client) client.end();
    }

    if (!product) {
        response.statusCode = 404;
        response.body = JSON.stringify({
            message: 'NotFound',
        });

        return response;
    }

    response.body = JSON.stringify(product, null, 2);

    return response;
};
