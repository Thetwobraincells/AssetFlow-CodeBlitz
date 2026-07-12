const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes will be mounted here
// app.use('/api/v1', routes);

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
