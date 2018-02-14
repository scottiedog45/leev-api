const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const {Service} = require('../models');

router.get('/', (req, res) => {
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

router.get('/:id', (req, res) => {
  let id = req.params.id;
  Service
    .findById(id)
    .then(service => res.status(201).json(service.apiRepr()))
    .catch(err => {
      console.log(err);
      res.status(500).json({error: 'something went wrong with single service GET'})
    });
});

router.post('/', (req, res) => {
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

// adding single member
router.post('/:id/members', (req, res) => {
  let id = req.params.id;
  let memberId = mongoose.Types.ObjectId(req.body.id);
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


//req body must be: {field: data}
//make sure this doesn't add extra id, use _id in Postman
router.patch('/:id', (req,res)=> {
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

//patches leave
router.patch('/:id/members/:member', (req, res) => {
  let id = req.params.id;
  let member= req.params.member;
  let leave = req.body.leave;
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
  .then(updatedMember => res.status(204).end())
  .catch(err=> res.status(500).json({message: 'something went wrong'}));
});


router.delete('/:id', (req, res)=> {
  Service
    .findByIdAndRemove(req.params.id)
    .then(()=>{
      console.log(`Deleted service with id \`${req.params.id}\``);
      res.status(204).end();
    });
});

  //works
  //'/:id/members/:member'
router.delete('/:id/members/:member', (req, res) => {
  let serviceId = req.params.id;
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

module.exports = {router};
