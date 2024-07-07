// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const cors = require('cors'); // Import cors
;
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Define a User schema
const userSchema = new mongoose.Schema({
    phone: { type: String, unique: true },
    loginTime: { type: Date, default: Date.now }
});

// Create a User model
const User = mongoose.model('User', userSchema);

// Login API
app.post('/login', async (req, res) => {
    const { phone, otp } = req.body;
    if (otp === '123456') {
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.json({ status: 'failure', message: 'User is already logged in.' });
        }
        const newUser = new User({ phone });
        await newUser.save();
        res.json({ status: 'success', message: 'User is logged in' });
    } else {
        res.json({ status: 'failure', message: 'Invalid OTP' });
    }
});

// Logout API
app.post('/logout', async (req, res) => {
    const { phone } = req.body;
    const user = await User.findOneAndDelete({ phone });
    if (user) {
        res.json({ status: 'success', message: 'User is logged out' });
    } else {
        res.json({ status: 'failure', message: 'User not found or already logged out' });
    }
});

// Home API
app.get('/home', async (req, res) => {
    const users = await User.find({}, { _id: 0, phone: 1, loginTime: 1 });
    res.json(users);
});

app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});
