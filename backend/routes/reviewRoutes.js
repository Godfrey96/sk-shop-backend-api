import express from 'express'
import {
    createProductReview
} from '../controllers/reviewController.js';

const router = express.Router()

router.route('/:id/reviews').post(createProductReview)

export default router