const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');

// Connect Database
connectDB();

// Init App
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));


// Define Routes
app.get("/", (req, res) => {
    res.send("API READY");
})

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/profile', require('./routes/api/profile.exp'));
app.use('/api/profile', require('./routes/api/profile.edu'));
app.use('/api/posts', require('./routes/api/posts'));


// Define Port
const PORT = process.env.PORT || 5000;

// Listen to port
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));