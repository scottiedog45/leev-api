const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const {Service, User, Member} = require('../models');
const {TEST_DATABASE_URL} = require('../config');
const {app, runServer, closeServer} = require('../server');
const should = chai.should();
const moment =require('moment');

var server = require('../server.js');
var storage = server.storage;
var objectId = require('mongodb').ObjectID;

//need a test JWT

chai.use(chaiHttp);
chai.use(require('chai-datetime'));

//service tests, then member tests, then user tests

function seedServiceData() {
  console.info('seedingService');
  const seedData = [];
  for (let i=0; i<=10; i++) {
    seedData.push(generateServiceData())
  }
  return Service.insertMany(seedData);
}

function generateCategory() {
  const categories = [
    'a', 'b', 'c'
  ];
  return categories[Math.floor(Math.random() * categories.length)]
}

function generateDate() {
  const date = new Date();
  return date;
}

function generateTime() {
  const time = new Date();
  return time;
}

function generateId() {
  const ids = [
    objectId(), objectId(), objectId()
  ];
  return ids[Math.floor(Math.random() * ids.length)]
}

function generateLeave() {
  const byeByes = [
    'a', 'b', 'c'
  ];
  return byeByes[Math.floor(Math.random() * byeByes.length)]
}

function generateMembers() {
  const members = [
    {
      leave: generateLeave()
    },{
      leave: generateLeave()
    }
  ];
  return members;
}

function generateServiceData() {
  return {
    category: generateCategory(),
    date: generateDate(),
    time: generateTime(),
    members: generateMembers()
  }
}

function tearDownDb() {
  console.warn('deleting database');
  return mongoose.connection.dropDatabase();
}

describe('service API', function() {



  before(function(){
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function(){
    return seedServiceData();
  });
  afterEach(function(){
    return tearDownDb();
  });
  after(function(){
    return closeServer();
  })

  describe('service GET endpoint', function() {
    it('should 200 on GET requests', function() {
      let res;

      return chai.request(app)
        .get('/api/services')

        .then(function(_res) {
          let res=_res;
          res.should.have.status(200);
          res.body.services.should.have.length.of.at.least(1);
          res.should.be.json;
          return Service.count();
        })
        .then(function(count){
          res.body.services.should.have.length.of(count);
        })
        .catch(err=>{
          console.error(err);
        });
      });
    });

    describe('POST endpoint', function() {
      it('succesfully updated database with new service', function() {
        const newService = generateServiceData();
        return chai.request(app)
          .post('/api/services')
          .send(newService)
          .then(function(res){
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.include.keys(
              'date', 'time', 'category', 'members'
            );
            res.body.category.should.equal(newService.category);
            res.body.id.should.not.be.null;
            return Service.findById(res.body.id);
          })
          .then(function(service){
            service.category.should.equal(newService.category);
          });
      });
    });

    describe('should succesfully PATCH new info', function() {
      it('should update specified fields', function() {
        const updateData = {
          id: '',
          category: 'someCategory',
          date: new Date()
        };
        return Service
          .findOne()
          .then(function(service){
            updateData.id=service.id;
            return chai.request(app)
              .patch(`/api/services/${service.id}`)
              .send(updateData);
          })
          .then(function(res){
            res.should.have.status(204);
            return Service.findById(updateData.id);
          })
          .then(function(service){
            service.category.should.equal(updateData.category);
            service.date.should.equalDate(updateData.date);
          });
      });
    });

    describe('should be a DELETE endpoint', function(){
      it('should delete a service by id', function(){
        let service;
        return Service
          .findOne()
          .then(function(_service) {
            service = _service;
            console.log(service);
            console.log(`/api/services/${service.id}`);
            return chai.request(app)
              .delete(`/api/services/${service.id}`);
          })
          .then(function(res){
            res.should.have.status(204);
            return Service
              .findById(service.id);
          })
          .then(function(_service){
            should.not.exist(_service);
          });
      });
    });
});

function seedMemberData() {
  console.info('seeding member');
  const seedData=[];
  for (let i=0; i<=10; i++) {
    seedData.push(generateMemberData());
  }
  return Member.insertMany(seedData);
}

function generateName() {
  const names=[
    'a', 'b', 'c'
  ];
  return names[Math.floor(Math.random()*names.length)];
}

function generateRole() {
  const roles=[
    'a', 'b', 'c'
  ];
  return roles[Math.floor(Math.random()*roles.length)];
}

function generateEmail() {
  const emails=[
    'a', 'b', 'c'
  ];
  return emails[Math.floor(Math.random()*emails.length)];
}

function generatePhone() {
  const phones=[
    'a', 'b', 'c'
  ];
  return phones[Math.floor(Math.random()*phones.length)];
}

function generateMemberData() {
  return {
    name: generateName(),
    phone: generatePhone(),
    email: generateEmail(),
    role: generateRole()
  }
}

describe('member API resource', function(){
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function(){
    return seedMemberData();
  });
  afterEach(function(){
    return tearDownDb();
  });
  after(function(){
    return closeServer();
  });

  describe('GET endpoint', function(){
    it('should return all existing members', function(){
      let res;
      return chai.request(app)
      .get('/api/members')
      .then(function(_res){
        res=_res;
        res.should.have.status(200);
        res.body.members.should.have.length.of.at.least(1);
        return Member.count();
      })
      .then(function(count){
        res.body.member.should.have.length.of(count);
      })
      .catch(err=>{
        console.error(err);
      });
    });
    it('should return members with correct fields', function(){
      let resMember;
      return chai.request(app)
        .get('/api/members')
        .then(function(res){
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);
          res.body.forEach(function(member){
            member.should.be.a('object');
            member.should.include.keys(
              'name', 'role', 'phone', 'email');
            });
            resMember = res.body[0];
            console.log(resMember);
            return Member.findById(resMember.id);
          })
          .then(function(member){
            console.log('a;sdhfkajdsfkajdflkajds;lkfja;sd');
            console.log(member);
            console.log(resMember);
            resMember.name.should.equal(member.name);
            resMember.role.should.equal(member.role);
            resMember.phone.should.equal(member.phone);
            resMember.email.should.equal(member.email);
          });
        });
    });
    describe('POST endpoint', function(){
      it('succesfully updated database with new member', function(){
        const newMember = generateMemberData();
        return chai.request(app)
          .post('/api/members')
          .send(newMember)
          .then(function(res){
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.include.keys(
              'name', 'email', 'role', 'phone', 'id'
            );
            res.body.name.should.equal(newMember.name);
            res.body.role.should.equal(newMember.role);
            res.body.phone.should.equal(newMember.phone);
            res.body.email.should.equal(newMember.email);
            res.body.id.should.not.be.null;
            return Member.findById(res.body.id);
          })
          .then(function(member){
            member.name.should.equal(newMember.name);
            member.email.should.equal(newMember.email);
            member.phone.should.equal(newMember.phone);
            member.role.should.equal(newMember.role);
          });
      });
    });
    describe('PATCH endpoint', function(){
      it('should update specified fields', function(){
        const updateData = {
          id: '',
          name: 'newName',
          role: 'newRole',
          email: 'newEmail',
          phone: 'newPhone'
        };
        return Member
          .findOne()
          .then(function(member){
            updateData.id=member.id;
            return chai.request(app)
              .patch(`/api/members/${member.id}`)
              .send(updateData);
          })
          .then(function(res){
            res.should.have.status(204);
            return Member.findById(updateData.id);
          })
          .then(function(member){
            member.name.should.equal(updateData.name);
            member.role.should.equal(updateData.role);
            member.email.should.equal(updateData.email);
            member.phone.should.equal(updateData.phone);
          });
      });
    });
    describe('DELETE endpoint', function() {
      it('should delete a member by id', function(){
        let member;
        return Member
          .findOne()
          .then(function(_member){
            member = _member;
            return chai.request(app)
              .delete(`/api/members/${member.id}`);
          })
          .then(function(res){
            res.should.have.status(203);
            return Member
            .findById(member.id);
          })
          .then(function(_newMember){
            should.not.exist(_newMember);
          });
      });
    });
  });

  //finish these...

// describe('USER api endpoint', function() {
//   before(function() {
//     return runServer(TEST_DATABASE_URL);
//   });
//   beforeEach(function(){
//     return seedUserData();
//   });
//   afterEach(function(){
//     return tearDownDb();
//   });
//   after(function(){
//     return closeServer();
//   });
//   describe('USER signup endpoint', function(){
//     it('succesfully updated db with new user', function(){
//       const newUser = generateUserData()''
//     })
//   })
// })
