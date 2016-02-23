var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/users');

var mysql = require('mysql');

// Setting up the connection to my local mySql database (running on a WAMP server)
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mySecrets"
});

// Connecting to the database
connection.connect(function (err) {
    if (err) {
        console.error("\nCould not connect to server " + err.stack + "\n");
    } else {
        console.log("\nSuccessfully connected to database with id " + connection.threadId + "\n");
    }
});

//connection.end();

// Querying the database
connection.query("SELECT * FROM User", function (err, rows, fields) {
    console.log("Queried all users from the database");
    if (err) {
        console.log("Could not process query. " + err);
    } else {
        console.log("Response recieved from query");
        for(var i = 0; i < rows.length; i++){
            console.log("User " + i + "'s username is: " + rows[i].username);
        }
        console.log("\n");
    }
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", session({
    secret: 'mySecretsApp',
    resave: false,
    saveUninitialized: false
}));

app.use("/users", function (req, res, next) {
    console.log("\nAttempt to access user facility");
    if (req.session.username != null) {
        console.log("This user is logged in. Taking them to the secrets page.\n");
        next();
    } else {
        console.log("This user is not not logged in. Returning them to the home page.\n");
        res.redirect("/");
    }
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
