import express from 'express';
import { config } from 'dotenv';
import colors from 'colors';
import path from 'path'
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './config/db.js';
// import { authJwt } from './middleware/jwt.js'
import { notFound, errorHandler } from './middleware/error-handler.js';

import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import orderRoutes from './routes/orderRoutes.js'


config()

const app = express()

app.use(cors())


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json())
// app.use(authJwt());

connectDB()

app.get('/', (req, res) => {
    res.send('API is running')
})

// const api = process.env.API_URL;

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/products', reviewRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/orders', orderRoutes);

// app.use(`${api}/users`, userRoutes);
// app.use(`${api}/products`, productRoutes);
// app.use(`${api}/products`, reviewRoutes);
// app.use(`${api}/categories`, categoryRoutes);
// app.use(`${api}/orders`, orderRoutes);


app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))