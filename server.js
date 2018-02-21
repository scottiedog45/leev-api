const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');

const {CLIENT_ORIGIN} = require('./config');
const {DATABASE_URL, PORT} = require('./config');

const app = express();

const { router: membersRouter } = require('./members/router');
const { router: servicesRouter} = require('./services/router');
const { router: usersRouter} = require('./users/router');

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);
app.use('/api/members/', membersRouter);
app.use('/api/services/', servicesRouter);
app.use('/api/users/', usersRouter);

mongoose.Promise = global.Promise;

app.use('*', function (req, res) {
	res.status(404).json({message: 'Not found, try again'});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`Your app is listening on port ${port}`);
				resolve();
			})
			.on('error', err => {
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};
