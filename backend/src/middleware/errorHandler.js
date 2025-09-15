export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message,
    });
  }

  if (err.type === 'shopify') {
    return res.status(502).json({
      error: 'Shopify API error',
      details: err.message,
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Database error',
      details: 'Invalid request data',
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not found',
    details: `Route ${req.method} ${req.path} not found`,
  });
};