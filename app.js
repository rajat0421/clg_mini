const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./user');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/userdata');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});



    

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        res.redirect('/home');
    } else {
        res.send('Login failed');
    }
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/views/register.html');
});

app.post('/register', async (req, res) => {
    const { name, email, password, usn, branch, year } = req.body;
    const newUser = new User({ name, email, password, usn, branch, year });
    try {
        await newUser.save();
        res.redirect('/home');
        console.log('Registration successful:', newUser);
    } catch (err) {
        console.error('Error registering user:', err);
        let message = 'Registration failed';
        if (err.code === 11000 && err.keyValue.email) {
            message = 'Email is already registered';
        } else if (err.errors && err.errors.email && err.errors.email.properties && err.errors.email.properties.message) {
            message = err.errors.email.properties.message;
        }
        res.status(400).send(message);
    }
});


   


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
