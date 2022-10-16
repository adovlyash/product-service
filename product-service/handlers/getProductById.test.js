import { productsList } from '../mocks/products'
import { getProductById } from './getProductById'

describe('getProductById handler', () => {
    it('should find item by id', async () => {
        const response = await getProductById({
            pathParameters: {
                id: '68375e0a-fe52-45b9-bf76-bc2e35cbb089',
            },
        })

        expect(JSON.parse(response.body)).toEqual((await productsList())[0])
    })

    it('should return 404 error if item not found', async () => {
        const response = await getProductById({
            pathParameters: {
                id: '68375e0a-fe52-45b9-bf76-bc2e35cbb088',
            },
        })

        expect(JSON.parse(response.statusCode)).toEqual(404)
    })
})
