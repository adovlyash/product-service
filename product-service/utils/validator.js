import * as yup from 'yup';

const productSchema = yup.object().shape({
    title: yup.string().required(),
    description: yup.string(),
    image: yup.string().url(),
    price: yup.number().required().positive().integer(),
    count: yup.number().required().positive().integer(),
});

export function validateProduct(product) {
    return productSchema.validate(product);
}
