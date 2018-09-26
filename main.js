const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
let morgan;

const router = require('./api/router');

const PORT = process.env.PORT || 3000;

// USE MORGAN IF NOT PRODUCTION ENV
if (!process.env.NODE_ENV || process.env.NODE_ENV.toLowerCase() !== 'production') {
  morgan = require('morgan');
  app.use(morgan('dev'));
}

// CHOOSE DB
mongoose.connect('mongodb://localhost:27017/TicTacToe',{useNewUrlParser: true});

// CONNECT TO DB
const db = mongoose.connection;
db.on('error', (err) => console.log(err));
db.once('open', () => console.log('db connected'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//MAIN ROUTE
app.use('/games', router);

app.listen(PORT, () => console.log(`Server started and listening on ${PORT} port`));