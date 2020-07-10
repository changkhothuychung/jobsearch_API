module.exports = (err, res, req, next) => {
    err.statusCode = err.statusCode || 500; 
    err.messsage = err.message || "Internal Server Error."; 


    if(process.env.NODE_ENV === 'development'){
        res.status(err.statusCode).json({
            success: false, 
            error: err,
            errMessage: err.message,
            stack: err.stack,
        })
    }

    if(process.env.NODE_ENV === 'production'){
        let error = {...err}; 
        error.message = err.message; 
        res.status(err.statusCode).json({
            success: false, 
            message: error.message || 'Internal Server Error.'
        })
    }

    
}