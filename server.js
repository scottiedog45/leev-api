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
  const requiredFields = ['name', 'role', 'email', 'phone'];
  for (let i=0; i< requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Member
    .create({
      name: req.body.name,
      role: req.body.role,
      email: req.body.email,
      phone: req.body.phone
    })
    .then(
      member=>res.status(201).json(member.apiRepr()))
      .catch(err=>{
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
      });
});

app.post('/leev/services', (req, res) => {
  const requiredFields = ['category', 'dateTime'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
  if(!(field in req.body)) {
    const message = `Missing \`${field}\` in request body`;
    console.error(message);
    return res.status(400).send(message);
  }
}
Service
  .create({
    category: req.body.category,
    dateTime: req.body.dateTime
  })
  .then(
    service=>res.status(201).json(service.apiRepr()))
  .catch(err=>{
    console.error(err);
    res.status(500).json({error: 'something went wrong '});
  });
});

app.put('leev/members/:id', (req, res)=> {
  console.log(req);
  if(!(req.params.id && req.body.id && req.params.id == req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must math'
    });
  }

  const update = {};
  const updateableFields = ['name', 'role', 'email', 'phone'];
  updateableFields.forEach(field=> {
    if (field in req.body) {
      updated[field]=req.body[field];
    }
  });

  Member
    .findByIdAndUpdate(req.params.id, {$set:updated}, {new:true})
    .then(updatedMember => res.status(204).end())
    .catch(err=> res.status(500).json({message: 'something went wrong'}));
});

app.put('leev/services/:id', (req,res)=> {
  console.log(req);
if(!(req.params.id && req.body.id && req.params.id == req.body.id)) {
  res.status(400).json({
    error: 'Request path id and request body id values must match'
  });
}

const updated = {};
const updateableFields = ['category', 'dateTime'];
updateableFields.forEach(field=> {
  if (field in req.body) {
      updated[field]=req.body[field];
    }
});

Service
  .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
  .then(updatedService => res.status(204).end())
  .catch(err=>res.status(500).json({message: 'something went wrong'}));
});

app.delete('/leev/members/:id', (req, res)=> {
  Member
    .findByIdAndRemove(req.params.id)
    .then(()=>{
      console.log(`Deleted member with id \`${req.params.id}\``);
      res.status(204).end();
    });
});

app.delete('/leev/services/:id', (req, res)=> {
  Service
    .findByIdAndRemove(req.params.id)
    .then(()=>{
      console.log(`Deleted service with id \`${req.params.id}\``);
      res.status(204).end();
    });
});

app.use('*', function (req, res) {
	res.status(404).json({message: 'Not found, try again'});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`Your app is listening on port ${port}`);
				resolve();
			})
			.on('error', err => {
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};
