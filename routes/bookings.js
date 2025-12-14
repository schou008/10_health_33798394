//Create a new router
const express = require("express");
const router = express.Router();

//Express-Validator
const { check, validationResult } = require("express-validator");

//Redirect middleware
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/users/login');
    } else {
    next();
    }
}

//Show Class Details
router.get('/book/:id', redirectLogin, function(req, res, next) {
    const classId = req.params.id;

    const sql = "SELECT * FROM classes WHERE class_id = ?";
    db.query(sql, [classId], (err, results) => {
        if (err) return next(err);
        if (results.length === 0) return res.send("Class not found.");

        res.render('classdetail.ejs', { classItem: results[0] });
    });
});

//Show All Classes
router.get('/book', redirectLogin, function(req, res, next) {
    const sql = "SELECT * FROM classes ORDER BY datetime ASC";
    db.query(sql, (err, results) => {
        if (err) return next(err);
        res.render('book.ejs', { classes: results });
    });
});

//Booking POST Route
router.post('/booked', redirectLogin, function (req, res, next) {

    const classId = req.body.class_id;
    const userName = req.session.userId;

    // First check if booking already exists
    const checkSql = `
        SELECT * FROM bookings 
        WHERE class_id = ? AND name = ?
    `;

    db.query(checkSql, [classId, userName], function (err, results) {
        if (err) return next(err);

        // If already booked
        if (results.length > 0) {
            return res.send("You have already booked this class.");
        }

        // Otherwise insert booking
        const insertSql = `
            INSERT INTO bookings (class_id, name)
            VALUES (?, ?)
        `;

        db.query(insertSql, [classId, userName], function (err, result) {
            if (err) return next(err);
            res.send("Booking successful!");
        });
    });
});

//View User Bookings
router.get('/viewbookings', redirectLogin, function (req, res, next) {

    const userName = req.session.userId;

    const sql = `
        SELECT 
            bookings.booking_id AS bookingId,
            classes.name AS className,
            classes.datetime AS classDate
        FROM bookings
        JOIN classes ON bookings.class_id = classes.class_id
        WHERE bookings.name = ?
        ORDER BY classes.datetime ASC
    `;

    db.query(sql, [userName], function (err, results) {
        if (err) return next(err);
        res.render("viewbookings.ejs", { bookings: results });
    });
});

//Export router
module.exports = router;
