//Create a new router
const express = require("express")
const router = express.Router()

//Express-Validator
const { check, validationResult } = require('express-validator');

//bcrypt requirements
const bcrypt = require('bcrypt')
const saltRounds = 10

//Redirect middleware
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        //Redirect to the login page
        res.redirect('./login')
    } else {
        //Move to the next middleware function
        next()
    }
}

//Register Form Page
router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

//Registered Handler
router.post('/registered',
    [
        check('email')
            .isEmail()
            .withMessage("Please enter a valid email address. Example #####@#####.com or #####@#####.co.uk"),

        check('username')
            .isLength({ min: 5, max: 20 })
            .withMessage("Username must be between 5 and 20 characters."),

        check('password')
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long."),

        check('first')
            .notEmpty()
            .withMessage("First name cannot be empty."),

        check('last')
            .notEmpty()
            .withMessage("Last name cannot be empty.")
    ],
    function (req, res, next) {

        const errors = validationResult(req);

        //If validation fails return to register page
        if (!errors.isEmpty()) {
            return res.render('register.ejs', { errors: errors.array() });
        }

        //Sanitize fields that can be displayed on pages
        const firstName = req.sanitize(req.body.first);
        const lastName  = req.sanitize(req.body.last);
        const email     = req.sanitize(req.body.email);
        const username  = req.sanitize(req.body.username);

        //Password is NOT sanitized
        const plainPassword = req.body.password;

        try {
            bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
                if (err) return next(err);

                const sql = 'INSERT INTO users (username, firstName, lastName, email, hashedPassword) VALUES (?, ?, ?, ?, ?)';
                const values = [username, firstName, lastName, email, hashedPassword];

                db.query(sql, values, function (error, _results) {
                    if (error) return next(error);

                    let result = 'Hello ' + firstName + ' ' + lastName + ' you are now registered! We will send an email to you at ' + email;
                    res.send(result);
                });
            });
        } catch (error) {
            next(error);
        }
    }
);

//List All Users
router.get('/list', redirectLogin, function (req, res, next) {
    const sqlquery = "SELECT username, firstName, lastName, email FROM users";

    db.query(sqlquery, (err, results) => {
        if (err) return next(err);

        //Render listusers.ejs with the user data
        res.render('listusers.ejs', { users: results });
    });
});

//Login Form Page
router.get('/login', function(req, res, next) {
    res.render('login.ejs')
})

//Login Handler
router.post('/loggedin', function(req, res, next) {
    //Sanitize username to prevent XSS
    const username = req.sanitize(req.body.username);
    //Do not sanitize password
    const password = req.body.password;

    //Select the hashed password for the user from the database
    const sql = "SELECT hashedPassword FROM users WHERE username = ?"

    db.query(sql, [username], function(err, results) {
        if (err) return next(err)

        //Username not found
        if (results.length === 0) {
            const auditFail = "INSERT INTO audit_log (username, success) VALUES (?, ?)"
            db.query(auditFail, [username, false])
            return res.send("Login failed: Incorrect username or password.")
        }

        const hashedPassword = results[0].hashedPassword

        bcrypt.compare(password, hashedPassword, function(err, same) {
            if (err) return next(err)

            if (same) {
                const auditSuccess = "INSERT INTO audit_log (username, success) VALUES (?, ?)"
                db.query(auditSuccess, [username, true])
                req.session.userId = username;
                return res.send("Login successful! Welcome back, " + username + ".")
            } else {
                const auditFail = "INSERT INTO audit_log (username, success) VALUES (?, ?)"
                db.query(auditFail, [username, false])
                return res.send("Login failed: Incorrect username or password.")
            }
        })
    })
})

//Audit Log History Page
router.get('/audit', redirectLogin, function (req, res, next) {

    const sql = "SELECT username, success, timestamp FROM audit_log ORDER BY timestamp DESC"

    db.query(sql, function (err, results) {
        if (err) return next(err)
        res.render('audit.ejs', { audit: results })
    })
})

//Export the router object so index.js can access it
module.exports = router
