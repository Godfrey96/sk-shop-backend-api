const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
}


const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode)
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    })
}

export { notFound, errorHandler }


// const errorHandler = (err, req, res, next) => {
//     if (err.name === 'UnauthorizedError') {
//         // jwt authentication error
//         return res.status(401).json({ message: 'The user is not authorized' })
//     }

//     if (err.name === 'ValidationError') {
//         // validation error
//         return res.status(401).json({ message: err })
//     }

//     // default to 500 server error
//     return res.status(500).json(err)
// }

// export { errorHandler }