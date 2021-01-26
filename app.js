if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Included Libraries
const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const members = require('./Members');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


mongoose.connect('mongodb://localhost/testdb', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));

const app = express();

// Passport Middleware
const initializePassport = require('./passport-config');
initializePassport(
    passport, 
    email => members.find(member => member.email === email),
    id => members.find(member => member.id === id)
);
app.use(flash());
app.use(session( {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Body Parser Middleware
app.use(express.json());
//app.use(express.urlencoded({extended : false}));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}));

// Handlebars Middleware
app.engine('handlebars', hbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

/**
 *  ROUTES START
 **/

// Route to Homepage
app.get('/', (req, res) => 
    res.render('index', {
        title: 'BlueBox TechDemo | Home'
    })
);

// Route to demo 2
app.get('/demon2', checkNotAuthenticated, (req, res) => 
    res.render('demon2', {
        title: 'Demo 2 - Login',
        members
    })
);

// Route to register page
app.get('/register', checkNotAuthenticated, (req, res) => 
    res.render('register', {
        title: 'Demo 2 - Register',
        members
    })
);

app.post('/demon2', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/success',
    failureRedirect: '/demon2',
    failureFlash: true
}));

app.get('/success', checkAuthenticated, (req, res) => 
    res.render('success', {
        title: 'Login Success | Demo 2',
        email: req.user.email
    })
);

app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/demon2');
});

// DEMO 1 Specific
const Text = require('./models/text');
const { route } = require('./routes/api/members');
const text = require('./models/text');

// Route to demo 1
app.get('/demon1', async (req, res) => {
    try {
        const textData = await Text.find({});
        res.render('demon1', {
            title: 'BlueBox TechDemo | Demo 1',
            textData: textData.map(textData => textData.toJSON())
        });
    } catch {
        res.redirect('/demon1');
    }
});

// Create new text file
app.get('/new', (req, res) => {
    res.render('demo1/new', { text: new Text() })
});

app.post('/demon1', async (req, res) => {
    const text = new Text({
        content: req.body.text
    });
    try{
        const newText = await text.save();
//      res.redirect(`authors/${newAuthor.id}`)
        res.redirect('/demon1');
    } catch {
        res.render('demo1/new', {
            text: text,
            errorMessage: 'Error creating new text'
        });
    }
});

// Delete a text file
app.delete('/demon1/:id', async (req, res) => {
    let text
    try{
        text = await Text.findById(req.params.id)
        await text.remove()
        red.redirect('/demon1')
    }catch{
        if (text == null){
            res.redirect('demon1')
        }else{
            res.render('demon1'),{
                text: text,
                errorMessage: "You done goofed"
            }
        }
    }
    res.send('Delete' + req.params.id)
});

// router.post('/demon1', async (req, res) => {
//     const text = new Text({
//       content: req.body.text
//     })
//     try {
//       const newText = await text.save()
//       // res.redirect(`authors/${newAuthor.id}`)
//       res.redirect('/demon1')
//     } catch {
//       res.render('demo1/new', {
//         text: text,
//         errorMessage: 'Error creating text'
//       })
//     }
//   })

/**
 *  ROUTES END
 **/

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }

    res.redirect('/demon2');
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/success');
    }

    next();
}

// Sets staic folder for all html pages
app.use(express.static(path.join(__dirname, 'public')));

// Members API Routes
app.use('/api/members', require('./routes/api/members'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
// respond with "hello world" when a GET request is made to the homepage
