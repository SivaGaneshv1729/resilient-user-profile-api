const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    
    let status = err.status || 500;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = err.message || 'An unexpected error occurred';
    let details = [];

    if (status === 404) {
        errorCode = 'RESOURCE_NOT_FOUND';
    } else if (status === 409) {
        errorCode = 'RESOURCE_CONFLICT';
    }

    res.status(status).json({
        errorCode,
        message,
        details
    });
};

module.exports = errorHandler;
