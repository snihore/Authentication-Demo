const {User} = require('./../models/user');

var authenticationMiddleware = (req, res, next)=>{
    var token = req.header('x-auth');
    User.findIdByToken(token).then((user)=>{
        req.user = user;
        req.token = token;
        next();
    }).catch((e)=>{
        res.sendStatus(400);
    }); 
}

module.exports = {authenticationMiddleware};