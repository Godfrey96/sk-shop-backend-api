import asyncHandler from 'express-async-handler'
import OrderItem from '../models/order-itemModel.js'
import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'
import Stripe from 'stripe'
import * as Razorpay from 'razorpay';

const stripe = new Stripe('sk_test_51JjjPCF3RlIhoq4AkOwHSs7EN8fr0t4lBuf3AvPCdgI3zGEgtf4k6rCTYcyOtyoDvX27ibOBQXeSbiNE5SzygoCl00a2iE3MGU');

// fetch all orders
const getOrders = asyncHandler(async (req, res) => {
    const orderList = await Order.find().populate('user', 'firstname').sort({ 'dateOrdered': -1 })

    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList)
})

// fetch single order
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        })

    if (!order) {
        res.status(500).json({ message: 'The order with the given ID was not found' })
    }
    res.status(200).send(order)
})

// create a new order
const createOrder = asyncHandler(async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))
    const orderItemsIdsResolved = await orderItemsIds

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0)

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        // address: req.body.address,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    if (!order) {
        return res.status(400).send('the order cannot be created!')
    }
    res.send(order)
})

// create checkout session or make payment
const createCheckoutSession = asyncHandler(async (req, res) => {
    const orderItems = req.body;

    if (!orderItems) {
        return res.status(400).send('checkout session cannot be created - check the order items')
    }

    const lineItems = await Promise.all(
        orderItems.map(async (orderItem) => {
            const product = await Product.findById(orderItem.product);
            return {
                price_data: {
                    currency: 'zar',
                    product_data: {
                        name: product.name
                    },
                    unit_amount: product.price * 100
                },
                quantity: orderItem.quantity
            };
        })
    );

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: 'http://localhost:4200/success',
        cancel_url: 'http://localhost:4200/error'
    })

    res.json({ id: session.id });
})

// create new order
// const newOrder = asyncHandler(async (req,res)=>{
//     const orderItems = new 
// })

// create order with razorpay
const newOrder = asyncHandler(async (req, res) => {
    const orderItems = req.body;
    try {
        const instance = new Razorpay({
            key_id: 'rzp_test_sscf2F2sQedNRq',
            secret_key: 'be1pCrHxvkPlrPa3aH4oGITz'
        });
        const options = {
            amount: orderItems.amount,  // amount in the smallest currency unit
            currency: orderItems.currency,
            // receipt: "order_rcptid_11"
        };
        instance.orders.create(options, function (err, order) {
            console.log(order);
            response.send("order" + order);
        });
    } catch (error) {
        response.status(500).json(error);
    }
})

// update order
const updateOrder = asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: req.body.status
    },
        { new: true }
    )
    if (!order) {
        return res.status(404).send('the order cannot be updated!');
    }
    res.send(order)
})

// delete order
const deleteOrder = asyncHandler(async (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({ success: true, message: 'the order is deleted' });
        } else {
            return res.status(404).json({ success: false, message: 'order not found' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

// get total sales of order
const getTotalSales = asyncHandler(async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ])

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({ totalsales: totalSales.pop().totalsales })
})

// get order count
const GetOrderCount = asyncHandler(async (req, res) => {
    const orderCount = await Order.countDocuments({})

    if (!orderCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        orderCount: orderCount
    })
})

// get users orders
const getUserOrders = asyncHandler(async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid })
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        })
        .sort({ 'dateOrdered': -1 })

    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList)
})

// // fetch my orders
// const getMyOrders = asyncHandler(async (req, res) => {
//     const myUserId = await Order.find({ user: req.params.userId }).sort({ 'dateOrdered': -1 });

//     if (!myUserId) {
//         res.status(500).json({ success: false });
//     }
//     res.send(myUserId);
// })

export {
    getOrders,
    createOrder,
    createCheckoutSession,
    getOrderById,
    updateOrder,
    deleteOrder,
    getTotalSales,
    GetOrderCount,
    getUserOrders,
    newOrder,
    // getMyOrders
}