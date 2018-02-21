const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const {User} = require('../models');
const jwt = require('jsonwebtoken');
const {JWT_KEY} = require ('../config');
const checkAuth = require('../middleware/middleware');

router.post('/signup', (req, res, next) => {
  User
    .find({
      email: req.body.email
    })
    .exec()
    .then(user => {
      if (user.length>= 1) {
        res.status(409).json({
          message: 'User email already in use'
        });
      } else {
        bcryptjs.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
              const user = new User({
                email: req.body.email,
                password: hash
              });
          user
          .save()
          .then(result => {
            console.log(result);
            res.status(201).json({
              message: 'User Created'
            })
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err
            });
          });
        }
        });
      }
    })
});

//add env variable to travis

router.post('/login', (req, res, next) => {
  User.find({
    email: req.body.email
  })
  .exec()
  .then(user => {
    if (user.length < 1 ) {
      return res.status(401).json({
        message: 'auth failed'
      });
    }
    bcryptjs.compare(req.body.password, user[0].password, (err, result) => {
      if (err) {
        return res.status(401).json({
          message: 'Auth failed'
        });
      } if (result) {
        const token = jwt.sign({
          email: user[0].email,
          userId: user[0]._id,
        },
        JWT_KEY,
      {
        expiresIn: "1hr"
      });
        return res.status(200).json({
          message: 'Auth successful',
          token: token
        });
      }
      res.status(401).json({
        message: 'Auth failed'

      });
    });
  })
  .catch(err=> {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
})

router.delete('/:userId', (req, res, next) => {
  User.remove({
    _id: req.params.userId
  })
  .exec()
  .then(result => {
    res.status(200).json({
      message: 'User deleted'
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

module.exports = {router};
