'use strict'

import { productsList } from '../mocks/products'

export const getProductsList = async () => {
    const products = await productsList()

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(products, null, 2),
    }
}
