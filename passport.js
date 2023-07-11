// set up Passport

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// Updated serialize/deserialize functions
passport.serializeUser((user, done) => {
	done(undefined, user._id);
});

passport.deserializeUser((userId, done) => {
	User.findById(userId, { password: 0 }, (err, user) => {
		if (err) {
			return done(err, undefined);
		}
		return done(undefined, user);
	});
});

// Set up "local" strategy, now not used in favour of using passport-local-mongoose authenticate
// so password field no longer used (hash and salt fields are used instead)
var strategy = new LocalStrategy((username, password, cb) => {
	console.log('Local strategy username password', username, password);
	// if no users in system, create a first user (need pasword to get hashed)
	User.find({}, (err, users) => {
		if (users.length > 0) return;
		User.create(
			{
				username: 'clinicianzero',
				password: 'singularity',
				displayname: 'superuser',
			},
			(err) => {
				if (err) {
					console.log(err);
					return;
				}
				console.log('Initial Superuser Created - pls change password');
			}
		);
	});

	// first, check if there is a user in the db with this username
	User.findOne({ username: username }, {}, {}, (err, user) => {
		if (err) {
			return cb(null, false, { message: 'Unknown error.' });
		}
		if (!user) {
			return cb(null, false, { message: 'Incorrect username.' });
		}
		// if there is a user with this username, check if the password matches
		user.verifyPassword(password, (err, valid) => {
			if (err) {
				return cb(null, false, { message: 'Unknown error.' });
			}
			if (!valid) {
				return cb(null, false, { message: 'Incorrect password.' });
			}
			return cb(null, user);
		});
	});
});

//passport.use(strategy)
passport.use(new LocalStrategy(User.authenticate()));

module.exports = passport;
