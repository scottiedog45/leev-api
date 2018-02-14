exports.DATABASE_URL=
  'mongodb://leev:leev@ds247587.mlab.com:47587/leevdatabase'

exports.TEST_DATABASE_URL=
  'mongodb://secondtestdatabase:secondtestdatabase@ds255347.mlab.com:55347/secondtestdatabase'

exports.PORT = process.env.PORT || 8000;

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

//heroku environment settings
//netflify gives free secure sservings
//client origin is just domain
//double check if https is needed
//means doesn't have to pay for security certificate
//new things out for sercurity certificates market bringing down price
// https://xenodochial-pare-c355a0.netlify.com
