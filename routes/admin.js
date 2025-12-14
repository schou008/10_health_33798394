//Create a new router
const express = require("express");
const router = express.Router();

//Admin auth middleware
const adminOnly = (req, res, next) => {
    if (!req.session.admin) {
        return res.redirect('./login');
    }
    next();
};

//Admin Login
router.get('/login', (req, res) => {
    res.render('adminlogin.ejs');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'gold' && password === 'smiths') {
        req.session.admin = true;
        return res.send("Admin login successful. You may now access admin pages.");
    } else {
        res.send("Invalid admin credentials");
    }
});

//Admin Dashboard
router.get('/dashboard', adminOnly, (req, res) => {
    res.render('admindashboard.ejs');
});

//List Classes
router.get('/classes', adminOnly, (req, res, next) => {
    const sql = "SELECT * FROM classes ORDER BY datetime ASC";
    db.query(sql, (err, results) => {
        if (err) return next(err);
        res.render('adminclasses.ejs', { classes: results });
    });
});

//Add Class
router.get('/classes/add', adminOnly, (req, res) => {
    res.render('addclass.ejs');
});

router.post('/classes/add', adminOnly, (req, res, next) => {
    const { name, instructor, datetime, duration, difficulty } = req.body;
    const sql = `
        INSERT INTO classes (name, instructor, datetime, duration, difficulty)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [name, instructor, datetime, duration, difficulty], err => {
        if (err) return next(err);
        res.redirect('/admin/classes');
    });
});

//Edit Class
router.get('/classes/edit/:id', adminOnly, (req, res, next) => {
    db.query(
        "SELECT * FROM classes WHERE class_id = ?",
        [req.params.id],
        (err, results) => {
            if (err) return next(err);
            res.render('editclass.ejs', { classItem: results[0] });
        }
    );
});

router.post('/classes/edit/:id', adminOnly, (req, res, next) => {
    const { name, instructor, datetime, duration, difficulty } = req.body;
    const sql = `
        UPDATE classes
        SET name=?, instructor=?, datetime=?, duration=?, difficulty=?
        WHERE class_id=?
    `;
    db.query(sql, [name, instructor, datetime, duration, difficulty, req.params.id], err => {
        if (err) return next(err);
        res.redirect('/admin/classes');
    });
});

//Delete Class
router.get('/classes/delete/:id', adminOnly, (req, res, next) => {
    db.query(
        "DELETE FROM classes WHERE class_id = ?",
        [req.params.id],
        err => {
            if (err) return next(err);
            res.redirect('/admin/classes');
        }
    );
});

//Logout
router.get('/logout', (req, res) => {
    req.session.admin = null;
    res.redirect('admin/login');
});

module.exports = router;