const mongoose = require('mongoose');

const leevMemberSchema = mongoose.Schema({
  name: {type: String},
  role: {type: String},
  email: {type: String},
  phone: {type: String},
  leave: {type: Array}
});

const leevServiceSchema = mongoose.Schema({
  category: {type: String},
  dateTime: {type: String},
  people: {type: Array}
});

leevMemberSchema.methods.apiRepr = function() {
  return {
    name: this.name,
    role: this.role,
    email: this. email,
    phone: this.phone,
    leave: this.leave,
    id: this.id
  };
}

leevServiceSchema.methods.apiRepr = function() {
  return {
    category: this.category,
    dateTime: this.dateTime,
    people: this.people
  };
}

const Service = mongoose.model('leevdatabase', leevServiceSchema, 'leevServices');

const Member = mongoose.model('leevedatabase', leevMemberSchema, 'leevMembers');

module.exports = {Service, Member};
