const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const { readdirSync } = require('fs');
require('dotenv').config();

// import routes

// app

const app = express();

// db
const db = mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB CONNECTED'))
  .catch((err) => console.log(`DB connection error`, err));

// middlewares

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '2mb' }));
app.use(cors());

// routes
readdirSync('./routes').map((route) =>
  app.use('/api', require('./routes/' + route))
);
// port
const port = process.env.PORT || 8000;

app.listen(port, () => console.log('listening to' + port));
