const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 1,
        validate: {
            validator: (v)=>{
                return validator.isEmail(v);
            },
            message: props => `${props.value} is not a valid email !`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens:[
        {
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }
    ]
});

userSchema.pre('save', function(next){
    var user = this;
    
    if(user.isModified('password')){
        var pwd = user.password;
        // console.log("==>", pwd);
        bcrypt.genSalt(9, (err, salt)=>{
            bcrypt.hash(pwd, salt, (err, hash)=>{
                user.password = hash;
                next();
            });
        });
    }else{
        next();
    }
});

userSchema.methods.toJSON = function(){
    var user = this;
    var userObj = user.toObject();

    return _.pick(userObj, ['_id', 'email']);
}

userSchema.methods.generateTokens = function(){
    var user = this;
    var access = 'auth';
    // console.log(user._id.toHexString());
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'srv123');

    user.tokens.push({access, token});
    return user.save().then(()=>{
       return token;
    });
}

userSchema.methods.removeToken = function(token){
    var user = this;
    return user.updateOne({
        $pull: {
            tokens:{token}
        }
    }).then(()=>{
        return Promise.resolve();
    }, ()=>{
        return Promise.reject();
    })
}

userSchema.statics.findIdByToken = function(token){
    var User = this;
    try{
        var id = jwt.verify(token, 'srv123')._id;
       
        return User.findOne({
            '_id': id,
            'tokens.token':token,
            'tokens.access':'auth'
        }).then((user)=>{
            if(!user){
                return Promise.reject();
            }
            return user;
        })
        
    }catch(e){
        return Promise.reject();
    }
    
}

userSchema.statics.findByCredentials = function(email, password){
    var User = this;
    return User.findOne({email}).then((doc)=>{
        if(!doc){
            return Promise.reject();
        }
        return new Promise((resolve, reject)=>{
            bcrypt.compare(password, doc.password, (e, ans)=>{
                if(ans){
                    resolve(doc);
                }else{
                    reject();
                }
            });
        });
    }, (e)=>{
        return Promise.reject();
    });
}





var User = mongoose.model('User', userSchema);

module.exports = {User};