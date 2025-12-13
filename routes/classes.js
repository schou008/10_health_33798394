//Create a new router
const express = require("express");
const router = express.Router();

//Express-Validator
const { check, validationResult } = require("express-validator");

//Redirect middleware
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/users/login');
    } else {
        next();
    }
};

//List All Classes
router.get('/list', function (req, res, next) {
    const sql = "SELECT * FROM classes ORDER BY datetime ASC";
    db.query(sql, (err, results) => {
        if (err) return next(err);
        res.render("list.ejs", { classes: results });
    });
});

//Search Classes
router.get('/search', function(req, res, next){
    res.render("search.ejs")
});

//Search Results
router.get('/search-result', function (req, res, next) {
    const term = "%" + req.sanitize(req.query.term) + "%";
    const sql = "SELECT * FROM classes WHERE name LIKE ? OR instructor LIKE ?";
    db.query(sql, [term, term], (err, results) => {
        if (err) return next(err);
        res.render("search-result.ejs", { classes: results, term: req.query.term });
    });
});


//Export router
module.exports = router;
