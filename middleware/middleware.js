const jwt = require('jsonwebtoken');
const {JWT_KEY} = require('../config');

module.exports = (req, res, next) => {
  console.log('getting here');
  try{
    console.log(req.headers);
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    const decoded = jwt.verify(token, JWT_KEY);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Auth failed'
    });
  }
};

//MAKE SURE YOU DELETE ALL OF THE EXTRA WHITESPACE IN THEHEADER
//VALUES
