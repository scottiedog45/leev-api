const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser')

const {CLIENT_ORIGIN} = require('./config');
const  {Member, Service} = require ('./models');
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

app.get('/leev/services/:id', (req, res) => {
  let id = req.params.id;
  Service
    .findById(id)
    .then(service => res.status(201).json(service.apiRepr()))
    .then(res => console.log(res))
    .catch(err => {
      console.log(err);
      res.status(500).json({error: 'something went wrong with single service GET'})
    });
});

//GETS LEAVE!!!!!
app.get('/leev/:id/leave', (req, res) => {
  let id = req.params.id;
  Service
    .find({members: {$elemMatch: {"id":id, leave: {$ne:""}}}})
    .then(services =>{
      res.json(services.map(
        (service)=>service.apiRepr())
      )})
    .catch(err=>{
      console.log(err);
      res.status(500).json({error: 'something went wrong with checking the leave'});
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

//add member to service
app.put('/leev/services/:id', (req, res) => {
  console.log('here by mistake');
  let id = req.params.id;
  let memberId = mongoose.Types.ObjectId(req.body.id);
  console.log('something');
  console.log(req.body);
  const requiredFields = ['id', 'leave'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Service
    .update({_id: id},
      {
    $push: {
      members: {_id: memberId, leave: ''}
      }
    })
    .then(
      service=>res.status(201).json(console.log(service)))
    .catch(err=>{
      console.error(err);
      res.status(500).json({error: 'something went wrong adding this member'});
    });
});

//putmany
app.put('/leev/services/many/:id', (req, res) => {
  console.log('getting hereeeeeee');
  let serviceId = req.params.id;
  let reqMembers = req.body.members;
  const requiredFields = ['members'];
  for (let i=0; i<requiredFields.length; i++) {
      const field = requiredFields[i];
      if(!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`;
        console.error(message);
        return res.status(400).send(message);
      }
    }
    Service
      .update({_id: serviceId},
        {
        members: reqMembers
      })
      .then(
        service=>res.status(201).json(console.log(service)))
      .catch(err=>{
        console.error(err);
        res.status(500).json({error: 'something went wrong adding this member'});
      });
    });


app.put('/leev/members/:id', (req, res)=> {
  console.log(req);
  if(!(req.params.id && req.body.id && req.params.id == req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }
  const updated = {};
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

//update Service info
app.put('/leev/services/info/:id', (req,res)=> {
  console.log('hitting the server');
  if(!(req.params.id && req.body.id && req.params.id == req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }
  const updated = {};
  const updateableFields = ['category', 'dateTime', 'members'];
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


//specific put endpoint to update member leave
app.put('/leev/services/:id/:member', (req, res) => {
  let id = req.params.id;
  let member= req.params.member;
  let leave = req.body.leave;
  console.log(req.params);
  console.log(req.body);
  if(!(req.params.id && req.body.id && req.params.id == req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }
  const updated = {};
  const updateableFields = ['members'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field]=req.body[field];
    }
  });
  Service
  .updateOne(
  {_id: id, 'members._id': member},
  {$set: {'members.$.leave': leave}})
  .then(Someres => console.log(Someres.body))
  .then(updatedMember => res.status(204).end())
  .catch(err=> res.status(500).json({message: 'something went wrong'}));
});

//delete all instances from member from all services
//pull all?
//remove method from mongoose
//https://stackoverflow.com/questions/14348516/cascade-style-delete-in-mongoose
//Matt mulowig, wordpress
//preact
app.delete('/leev/members/:id', (req, res)=> {
  let id = req.params.id;
  Service
    .updateMany(
      {},
      {$pull:{members: {_id: id}}}
    )
    .then(()=>{
      console.log('Deleted member from all services');
    res.status(203).end();
  }).catch(err=> res.status(500).json({message: 'something went wrong'}));
  Member
    .findByIdAndRemove(id)
    .then(()=>{
      console.log(`Deleted member with id \`${req.params.id}\``);
      res.status(204).end();
    });
});

//works
app.delete('/leev/services/:id', (req, res)=> {
  Service
    .findByIdAndRemove(req.params.id)
    .then(()=>{
      console.log(`Deleted service with id \`${req.params.id}\``);
      res.status(204).end();
    });
});

//works
app.delete('/leev/services/:service/:member', (req, res) => {
  let serviceId = req.params.service;
  let memberId = req.params.member;
  Service
    .findOne({_id: serviceId})
    .update({_id: serviceId}, {$pull: {members: {_id: memberId}}})
    .then((someResponse) => {
      console.log(`Removed \`${req.params.member}\` from \`${req.params.service}`);
      res.status(204).end();
    })
    .catch(err=> {
      res.status(500).json({message: 'something went wrong'});
      console.log(err)})
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
