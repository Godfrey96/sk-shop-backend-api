import express from 'express'
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    GetProductCount,
    getFeaturedProduct,
    getBestSellerProduct,
    getProductByCategory
} from '../controllers/productController.js'

const router = express.Router()

router
    .route('/')
    .get(getProducts)
    .post(createProduct)
router
    .route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct)
router.route('/get/count').get(GetProductCount)
router.route('/get/featured/:count').get(getFeaturedProduct)
router.route('/get/bestseller/:count').get(getBestSellerProduct)
router.route('/get/product-by-category/:category').get(getProductByCategory)

export default router