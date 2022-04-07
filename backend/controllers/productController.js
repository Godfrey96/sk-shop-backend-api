import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import Product from '../models/productModel.js'
import Category from '../models/categoryModel.js'

// get all products
const getProducts = asyncHandler(async (req, res) => {
    let filter = {}
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }
    const productList = await Product.find(filter).populate('category').sort({ 'updatedAt': -1 })

    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList)
})

// get single product
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')

    if (!product) {
        res.status(500).json({ success: False })
    }
    res.send(product);
})

// create a new product
const createProduct = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        reviews: req.body.reviews,
        numReviews: req.body.numReviews,
        rating: req.body.rating,
        isFeatured: req.body.isFeatured,
        isBestSeller: req.body.isFeatured
    })
    product = await product.save();

    if (!product) {
        return res.status(400).send('the product cannot be created!')
    }
    res.send(product)
})

// update a product
const updateProduct = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')

    const product = await Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        reviews: req.body.reviews,
        numReviews: req.body.numReviews,
        rating: req.body.rating,
        isFeatured: req.body.isFeatured,
        isBestSeller: req.body.isBestSeller
    },
        { new: true }
    )
    if (!product) {
        return res.status(404).send('the product cannot be updated!');
    }
    res.send(product)
})

// delete a product
const deleteProduct = asyncHandler(async (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: 'the product is deleted' });
        } else {
            return res.status(404).json({ success: false, message: 'product not found' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

// get products count
const GetProductCount = asyncHandler(async (req, res) => {
    const productCount = await Product.countDocuments({})

    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        productCount: productCount
    });
})

// ger featired products
const getFeaturedProduct = asyncHandler(async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count)

    if (!products) {
        res.status(500).json({ success: false })
    }
    res.send(products);
})

// ger featired products
const getBestSellerProduct = asyncHandler(async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isBestSeller: true }).limit(+count)

    if (!products) {
        res.status(500).json({ success: false })
    }
    res.send(products);
})

// get product by category
const getProductByCategory = asyncHandler(async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }
    const categoryPostList = await Product.find({ category: req.params.category }, filter).populate('category').sort({ 'updatedAt': -1 });

    if (!categoryPostList) {
        res.status(500).json({ success: false })
    }
    res.send(categoryPostList)
})

export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    GetProductCount,
    getFeaturedProduct,
    getBestSellerProduct,
    getProductByCategory
}