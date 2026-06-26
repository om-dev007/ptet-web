const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const { authenticate, authorize } = require('./middleware/authMiddleware'); // already exists


const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const adminMaterialRoutes = require('./routes/admin/materialRoutes');
const savedMaterialRoutes = require('./routes/savedMaterialRoutes');
const tipRoutes = require('./routes/tipRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/users/:id/saved', savedMaterialRoutes);
app.use('/api/tips', tipRoutes);

// Admin material routes – protected by authentication and admin role
app.use('/api/admin/materials', authenticate, authorize('admin'), adminMaterialRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling (must be last)
app.use(errorHandler);

module.exports = app;