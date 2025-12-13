//Load environment variables from .env
require('dotenv').config();

console.log('DB User:', process.env.HEALTH_USER);
console.log('DB Password:', process.env.HEALTH_PASSWORD);
console.log('DB Name:', process.env.HEALTH_DATABASE);

//Import express and ejs
var express = require('express')
var ejs = require('ejs')
const path = require('path')

//Import express session
var session = require('express-session');

//Import mysql2
var mysql = require('mysql2')

//Import express-sanitizer
const expressSanitizer = require('express-sanitizer');

//Create the express application object
const app = express()
const port = 8000

//Create a session 
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

//Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

//Set up the body parser 
app.use(express.urlencoded({ extended: true }))

//Create an input sanitizer
app.use(expressSanitizer());

//Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')))

//Define our application-specific data
app.locals.shopData = {shopName: "FitBook"}

//Define the database connection pool 
const db = mysql.createPool({
    host: 'localhost',
    user: process.env.HEALTH_USER,
    password: process.env.HEALTH_PASSWORD,
    database: process.env.HEALTH_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
global.db = db; 

//Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

//Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

//Load the route handlers for /books
const bookingsRoutes = require('./routes/bookings')
app.use('/bookings', bookingsRoutes)

//Load the route handlers for /classes
const classesRoutes = require('./routes/classes')
app.use('/classes', classesRoutes)  

//Load the route handlers for /admin
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

//Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))