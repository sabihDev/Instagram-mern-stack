const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routers/auth.router'); // Assuming your authentication routes are in routes/auth.js

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use(authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
