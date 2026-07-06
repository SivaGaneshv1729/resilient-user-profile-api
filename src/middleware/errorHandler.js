function errorHandler(err, req, res, next) {
    console.error(err);

    if (err.isJoi) {
        return res.status(400).json({
            errorCode: 'INVALID_INPUT',
            message: 'Validation failed',
            details: err.details.map(detail => detail.message)
        });
    }

    if (err.message === 'RESOURCE_NOT_FOUND') {
        return res.status(404).json({
            errorCode: 'RESOURCE_NOT_FOUND',
            message: 'The requested user could not be found.',
            details: []
        });
    }

    if (err.message === 'EMAIL_DUPLICATE') {
        return res.status(409).json({
            errorCode: 'EMAIL_DUPLICATE',
            message: 'A user with this email already exists.',
            details: []
        });
    }

    if (err.message.includes('HTTP error! status: 503') || err.message === 'OpenCircuitError') {
        return res.status(503).json({
            errorCode: 'SERVICE_UNAVAILABLE',
            message: 'The external enrichment service is currently unavailable.',
            details: []
        });
    }

    // Fallback unhandled errors
    res.status(500).json({
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
        details: []
    });
}

module.exports = errorHandler;
