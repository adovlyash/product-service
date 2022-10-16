'use strict'

import { productsList } from '../mocks/products'

export const getProductById = async (event) => {
    const idParam = event.pathParameters.id
    const products = await productsList()
    const product = products.find(({ id }) => id == idParam)

    if (!product) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'NotFound',
            }),
        }
    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(product, null, 2),
    }
}
