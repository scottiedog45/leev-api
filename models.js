const mongoose = require('mongoose');

const MemberSchema = mongoose.Schema({
  name: {type: String},
  role: {type: String},
  email: {type: String},
  phone: {type: String}
});

//no inherent reinforcing the relationship for mongoose
//ex. try to add member that isn't in member database, should error
//sql will bork if you try to mess w/ connected objects
//how does mongoose enforce objectid type
//check datetime type, could/should be date type

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

const Service = mongoose.model('services', ServiceSchema, 'leevServices');

const Member = mongoose.model('members', MemberSchema, 'leevMembers');

module.exports = {Member, Service};
