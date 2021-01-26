const LocalStrategy = require('passport-local').Strategy;

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const member = getUserByEmail(email);
        if(member == null) {
            return done(null, false, { message: 'No registered member' });
        }

        if(password == member.password) {
            return done(null, member);
        } else {
            return done(null, false, { message: 'Incorrect Password!'});
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((member, done) => done(null, member.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    });
    
}

module.exports = initialize;