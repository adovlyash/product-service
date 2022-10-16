'use strict';
import { getDBClient } from '../utils/db-client';
import { validateProduct } from '../utils/validator';

export const createProduct = async (event) => {
    console.log('[Create Product lambda] incoming request, event:', event);

    let client;
    const response = {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };

    try {
        // For testing purpose only
        const error = event?.queryStringParameters?.error;
        if (error && Boolean(error)) throw new Error('Test 500 error');

        const newProduct = JSON.parse(event.body);

        try {
            await validateProduct(newProduct);
        } catch ({ errors }) {
            response.statusCode = 400;
            response.body = JSON.stringify(errors);

            return response;
        }

        client = await getDBClient();

        const query = `
            insert into products (title, description, price, image) values
            ('${newProduct.title}', '${newProduct.description}', ${newProduct.price}, '${newProduct.image}')
            returning id;
        `;
        const { rows } = await client.query(query);
        const { stocksRows } = await client.query(`
            insert into stocks (product_id, count) values
            ('${rows[0].id}', ${newProduct.count});
        `);
        console.log('stocksRows', stocksRows);
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

    response.body = JSON.stringify(
        {
            message: 'Created',
        },
        null,
        2,
    );

    return response;
};
