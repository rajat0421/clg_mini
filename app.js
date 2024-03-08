const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./user');
const multer = require('multer');
const Event = require('./event');
const path = require('path');


const app = express();
const port = 3003;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json())
app.use(express.urlencoded({ extended: false }));

mongoose.connect('mongodb://localhost:27017/userdata');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/landing.html');
});



app.get('/user', (req, res) => {
    res.sendFile(__dirname + '/views/user.html');
});
    
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/views/admin.html');
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
        res.send('Incoorect Credential');
    }
});

// app.get('/username', async (req, res) => {
//     // Assuming you're using session-based authentication and the user's email is stored in the session
//     const { email } = req.session;
//     const user = await User.findOne({ email });
//     if (user) {
//         res.json({ username: user.username });
//     } else {
//         res.status(404).json({ error: 'User not found' });
//     }
// });



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

app.get('/sem', (req, res) => {
    res.sendFile(__dirname + '/views/sem.html');
});

app.get('/event', (req, res) => {
    res.sendFile(__dirname + '/views/event.html');
});

// POST endpoint to upload an event
app.post('/upload-event', upload.single('image'), async (req, res) => {
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


app.post('/attendance/:usn', async (req, res) => {
    const { usn } = req.params;
    const { subject, conductedClasses, attendedClasses } = req.body;

    try {
        const user = await User.findOne({ usn });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the subject already exists in the attendance array
        const existingRecordIndex = user.attendance.findIndex(record => record.subject === subject);
        if (existingRecordIndex !== -1) {
            // Update existing record
            user.attendance[existingRecordIndex].conductedClasses = conductedClasses;
            user.attendance[existingRecordIndex].attendedClasses = attendedClasses;
        } else {
            // Create new record
            user.attendance.push({ subject, conductedClasses, attendedClasses });
        }

        await user.save();
        res.status(200).json({ message: 'Attendance record saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/get-attendance/:usn', async (req, res) => {
    const { usn } = req.params;

    try {
        const user = await User.findOne({ usn });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ attendance: user.attendance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/add-attendance', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add-attendance.html'));
});



app.get('/attendance-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'attendance-details.html'));
});

app.get('/add_event', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add_event.html'));
});



app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
