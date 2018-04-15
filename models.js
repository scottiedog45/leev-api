const mongoose = require('mongoose');
const moment = require('moment');
moment().format();

const MemberSchema = mongoose.Schema({
  name: {type: String},
  role: {type: String},
  email: {type: String},
  phone: {type: String},
  allottedLeave:{
    medical: { type: Number, _id: false},
    left: { type: Number, _id: false},
    vacation: {type: Number, _id: false},
    late: {type: Number, _id: false},
    sick: {type: Number, _id: false},
    relief: {type: Number, _id: false},
    bereavement: {type: Number, _id: false},
    pregnancy: {type: Number, _id: false},
    maternity: {type: Number, _id: false},
    military: {type: Number, _id: false},
    jury: {type: Number, _id: false},
    religious: {type: Number, _id: false},
    holiday: {type: Number, _id: false},
    voting: {type: Number, _id: false}
  }
});

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: { type: String, required: true}
})

const ServiceSchema = mongoose.Schema({
  category: {type: String},
  date: {type: Date},
  time: {type: Date},
  members: [
    {id: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
    leave: {type: String}}
  ]
  });


MemberSchema.methods.apiRepr = function() {
  return {
    name: this.name,
    role: this.role,
    email: this.email,
    phone: this.phone,
    id: this.id,
    allottedLeave: this.allottedLeave
  };
}

ServiceSchema.methods.apiRepr = function() {
  return {
    category: this.category,
    date: this.date,
    time: this.time,
    members: this.members,
    id: this.id
  };
}

const User = mongoose.model('users', UserSchema, 'leevUsers');

const Service = mongoose.model('services', ServiceSchema, 'leevServices');

const Member = mongoose.model('members', MemberSchema, 'leevMembers');

module.exports = {Member, Service, User};
