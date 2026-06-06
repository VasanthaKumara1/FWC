// Express middleware for production
const logger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(status).json({ error: message });
};

const notFound = (req, res) => {
  res.status(404).json({ error: 'Not found' });
};

module.exports = { logger, errorHandler, notFound };
