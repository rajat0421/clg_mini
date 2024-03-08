const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./user');
const multer = require('multer');
const Event = require('./event');





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
        res.sendFile(__dirname + '/views/home.html');
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
        res.sendFile(__dirname + '/views/home.html');
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

// GET endpoint to retrieve all registered users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        console.error('Error retrieving users:', err);
        res.status(500).send('Internal Server Error');
    }
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory

app.get('/event', (req, res) => {
    res.sendFile(__dirname + '/views/event.html');
});

// POST endpoint to upload an event
app.post('/upload', upload.single('image'), async (req, res) => {
    const { caption } = req.body;
    const imageUrl = req.file.path.replace('public\\', '');
    const newEvent = new Event({ caption, imageUrl });
    try {
        await newEvent.save();
        res.redirect('/event');
        console.log('Event uploaded successfully:', newEvent);
    } catch (err) {
        console.error('Error uploading event:', err);
        res.status(400).send('Event upload failed');
    }
});

// GET endpoint to retrieve all events
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find({});
        res.json(events);
    } catch (err) {
        console.error('Error retrieving events:', err);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
