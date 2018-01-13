const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser')

const {CLIENT_ORIGIN} = require('./config');
const {Member, Service} = require ('./models');
const {DATABASE_URL, PORT} = require('./config');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

mongoose.Promise = global.Promise;

app.get('/leev/members', (req, res) => {
  Member
    .find()
    .then(members=>{
      res.json(members.map(
        (member)=>member.apiRepr())
      );
    })
    .catch(err=>{
      console.log(err);
      res.status(500).json({error: 'something when wrong with members GET'});
    });
});

app.get('/leev/services', (req, res) => {
  Service
    .find()
    .then(services=>{
      res.json(services.map(
        (service)=>service.apiRepr())
      );
    })
    .catch(err=>{
      console.log(err);
      res.status(500).json({error: 'something went wrong with Services GET'});
    });
});

app.post('/leev/members', (req, res) => {
  const requiredFields = ['name', 'role', 'email', 'phone']
});

app.put();

app.delete();

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {app};
