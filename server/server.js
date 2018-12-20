const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectId} = require('mongodb');

const {mongoose} = require('./config/dbconfig');
const {User} = require('./models/user');
const {Data} = require('./models/data');
const {authenticationMiddleware} = require('./middleware/authentication');

const port = process.env.PORT || 3000;

var app = express();
app.use(bodyParser.json());

app.post('/user', (req, res)=>{
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
    user.save().then(()=>{
        return user.generateTokens();
    }).then((token)=>{
        res.header('x-auth', token).send(user);
    }).catch((e)=>{
        res.sendStatus(400);
    });
});



app.get('/user/me', authenticationMiddleware, (req, res)=>{
      res.send(req.user);
});

app.post('/login', (req, res)=>{
    var body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password).then((user)=>{
        user.generateTokens().then((token)=>{
            res.header('x-auth', token).send(user);
        });
    }, (e)=>{
        res.sendStatus(400);
    });
});

app.delete('/user/me/token', authenticationMiddleware, (req, res)=>{
    var user = req.user;
    var token = req.token;
    user.removeToken(token).then(()=>{
        res.sendStatus(200);
    }, (e)=>{
        res.sendStatus(400);
    });
    
});

app.post('/data', authenticationMiddleware, (req, res)=>{
    body = _.pick(req.body, ['text', 'completed']);
    var id = req.user._id;
    body._creator = id;
    var data = new Data(body);
    data.save().then((data)=>{
        res.send(data);
    }, (e)=>{
        res.sendStatus(401);
    })
});

app.get('/data/get', authenticationMiddleware, (req, res)=>{
    var _creator = req.user._id;
    Data.find({_creator}).then((datas)=>{
        if(!datas){
            return res.send(400);
        }
        res.send({datas});
    }, (e)=>{
        res.sendStatus(401);
    })
});

app.get('/data/get/:id', authenticationMiddleware, (req, res)=>{
    var _id = req.params.id;
    var _creator = req.user._id;

    if(!ObjectId.isValid(_id)){
        return res.sendStatus(400);
    }

    Data.findOne({_id, _creator}).then((data)=>{
        if(!data){
            return res.sendStatus(400);
        }
        res.send({data});
    }, (e)=>{
        res.sendStatus(401);
    })

});


app.listen(port, ()=>{
    console.log(`Listen on Port ${port}`);
});