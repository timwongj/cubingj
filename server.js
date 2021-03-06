var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var passport = require('passport'), LocalStrategy = require('passport-local');
var sessions = require('client-sessions');
var bcrypt = require('bcryptjs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

// define session cookie
app.use(sessions({
    cookieName: 'session',
    secret: '9ds8yafhoi3a932ubnfnkdsoasa83hkffo'
}));

// serve pages in the public directory
app.use(express.static(__dirname + '/public'));

// connect to mongoDB
var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/auth';
mongoose.connect(connectionString);

// define User Schema
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define passport strategy
passport.use(new LocalStrategy (function (username, password, done) {
    User.findOne({username:username}, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message:'Incorrect username or password.'});
        }
        if (!user.validPassword(password)) {
            return done(null, false, {message:'Incorrect username or password.'});
        }
        return done(null, user);
    });
}));

var User = mongoose.model('User', new Schema ({
    id: ObjectId,
    firstName: String,
    lastName: String,
    email: {type: String, unique: true},
    password: String
}));

app.post('/signUp', function(req, res) {
    if (req.session && req.session.user)
        res.json({status:'yw', result:req.session.user});
    else {
        var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
        var user = new User({
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            email:req.body.email,
            password:hash
        });
        user.save(function(err) {
            if (err)
                res.json({status:'bj', result:err});
            else
                res.json({status:'gj', result:user});
        });
    }
});

app.post('/login', function(req, res) {
    if (req.session && req.session.user)
        res.json({status:'yw', result:req.session.user});
    else {
        User.findOne({email: req.body.email}, function (err, user) {
            if (!user) {
                res.json({status:'bj', result:err});
            }
            else if (bcrypt.compareSync(req.body.password, user.password)) {
                req.session.user = user;
                res.json({status:'gj', result:user});
            }
            else {
                res.json({status:'bj', result:err});
            }
        });
    }
});

app.get('/profile', function(req, res) {
    if (req.session && req.session.user) {
        User.findOne({email: req.session.user.email}, function (err, user) {
            if (user) {
                res.json({status:'gj', result:user});
            } else {
                req.session.reset();
                res.json({status:'bj', result:err});
            }
        });
    } else {
        res.json({status:'bj', result:null});
        console.log('Session does not exist');
    }
});

app.post('/logout', function(req, res) {
    req.session.reset();
    res.send({status:'gj', result:null});
});

var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.listen(port, ip);
