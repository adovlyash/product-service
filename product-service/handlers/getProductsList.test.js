import { productsList } from '../mocks/products'
import { getProductsList } from './getProductsList'

describe('getProductsList handler', () => {
    it('should return mocked data', async () => {
        const response = await getProductsList()
        expect(JSON.parse(response.body)).toEqual(await productsList())
    })
})
