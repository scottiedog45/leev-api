const mongoose = require('mongoose');
const moment = require('moment');
moment().format();

const MemberSchema = mongoose.Schema({
  name: {type: String},
  role: {type: String},
  email: {type: String},
  phone: {type: String}
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
  dateTime: {type: Date},
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
    id: this.id
  };
}

ServiceSchema.methods.apiRepr = function() {
  return {
    category: this.category,
    dateTime: this.dateTime,
    members: this.members,
    id: this.id
  };
}

const User = mongoose.model('users', UserSchema, 'leevUsers');

const Service = mongoose.model('services', ServiceSchema, 'leevServices');

const Member = mongoose.model('members', MemberSchema, 'leevMembers');

module.exports = {Member, Service, User};
