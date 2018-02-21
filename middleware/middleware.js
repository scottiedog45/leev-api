const jwt = require('jsonwebtoken');
const {JWT_KEY} = require('../config');

module.exports = (req, res, next) => {
  console.log('getting here');
  try{
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

//bug, when I add the bearer <token> to the headers,
//the message can't be found, only when it's in the body does it work
//Works: application json as header, and no auth header
