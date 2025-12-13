//Create a new router
const express = require("express")
const router = express.Router()

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

//Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

//About route
router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

//Logout route
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./')
        }
        res.send("You are now logged out. <a href='./'>Home</a>");
    })
})

//Export the router object so index.js can access it
module.exports = router