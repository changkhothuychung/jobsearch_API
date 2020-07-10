const express = require('express');
const app = express(); 
const dotenv = require('dotenv'); 
const connectDatabase = require('./config/database');
const mongoose = require('mongoose');
const errorHandler = require('./middlewares/error');
const ErrorHandle = require('./utils/errorHandler');
const auth = require('./routes/auth');
const jobs = require('./routes/jobs'); 
const user = require('./routes/user');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload'); 
const bodyParser = require('body-parser');
const cors = require('cors'); 

// configure the environment

dotenv.config({path: './config/config.env'});
const PORT = process.env.PORT; 
// jobs
//handle uncaught exception

app.use(express.json());

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public')); 

app.use(cookieParser());
app.use(errorHandler);
app.use(fileUpload()); 
connectDatabase();

app.use(jobs); 
app.use(auth); 
app.use(user);
app.all('*', (req,res,next) => {
    next(new ErrorHandle(`${req.originalUrl} route not found` , 404))
})



//connect to database

console.log("hello");
const server = app.listen(PORT, () => {
    console.log(`server is running ${process.env.PORT}`);
});

