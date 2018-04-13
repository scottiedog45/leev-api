const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/middleware');


const {Member, Service} = require('../models');

router.get('/', (req, res) => {
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

router.get('/:id/leave', (req, res) => {
  let id = req.params.id;
  Service
    .find({members: {$elemMatch: {_id:id, leave: {$ne:""}}}})
    .then(services =>{
      res.json(services.map(
        (service)=>service.apiRepr())
      )})
    .catch(err=>{
      console.log(err);
      res.status(500).json({error: 'something went wrong with checking the leave'});
    });
});

router.post('/',(req, res) => {
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
      phone: req.body.phone,
      allottedLeave: {
        medical: 0,
        left: 0,
        vacation: 0,
        late: 0,
        sick: 0,
        relief: 0,
        bereavement: 0,
        pregnancy: 0,
        maternity: 0,
        military: 0,
        jury: 0,
        religious: 0,
        holiday: 0,
        voting: 0}
    })
    .then(
      member=>res.status(201).json(member.apiRepr()))
      .catch(err=>{
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
      });
});


router.patch('/:id', (req, res)=> {
  console.log('patching');
  const updated = {};
  const updateableFields = ['name', 'role', 'email', 'phone', 'allottedLeave'];
  updateableFields.forEach(field=> {
    if (field in req.body) {
      updated[field]=req.body[field];
    }
  });
  Member
    .findByIdAndUpdate(req.params.id, {$set:updated}, {new:true})
    .catch(err=> res.status(500).json({message: 'something went wrong'}))
    .then(
      () => res.status(204).end());
});

router.delete('/:id', (req, res)=> {
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

module.exports = {router};
