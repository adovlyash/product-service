'use strict';
import { getDBClient } from '../utils/db-client';

export const getProductsList = async (event) => {
    console.log('[Get Products List lambda] incoming request, event:', event);

    let client;
    let products = [];
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

        client = await getDBClient();

        const { rows } = await client.query(`
            select products.id, products.title, products.description, products.price, products.image, stocks.count  from products
            inner join stocks on products.id=stocks.product_id;
        `);
        products = rows;
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

    response.body = JSON.stringify(products, null, 2);

    return response;
};
