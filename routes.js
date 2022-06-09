const passport = require('passport')
const bcrypt = require('bcrypt')


const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated())
        return next()

    res.redirect('/')
}


module.exports = function (app, myDataBase) {
    app.route('/')
        .get((req, res) => {
            res.render(process.cwd() + '/views/pug/index', {
                title: "Connected to Database",
                message: 'Please login',
                showLogin: true,
                showRegistration: true
            })
        })

    app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {

    })

    app.route('/logout')
        .get((req, res) => {
            req.logout()
            res.redirect('/')
        })

    app.route('/profile')
        .get(ensureAuthenticated, (req, res) => {
            res.render(process.cwd() + '/views/pug/profile', {
                username: req.user.username
            })
        })

    app.route('/register')
        .post((req, res, next) => {
            myDataBase.findOne({ username: req.body.username }, (err, user) => {
                if (err)
                    return next(err)

                if (user)
                    return res.redirect('/')

                const hash = bcrypt.hashSync(req.body.password, 12)

                myDataBase.insertOne({
                    username: req.body.username,
                    password: hash
                }, (err, doc) => {
                    if (err)
                        res.redirect('/')
                    else
                        // The inserted document is held within
                        // the ops property of the doc
                        next(null, doc.ops[0])
                })
            })
        }, passport.authenticate('local', { failureRedirect: '/' }), (req, res, next) => {
            res.redirect('/profile')
        })
}