const {ObjectID}=require('mongodb');
const jwt= require('jsonwebtoken');
const moment =require('moment');

const {User}= require('./../../models/user');

const userOneId= new ObjectID();
const userTwoId= new ObjectID();
const userThreeId= new ObjectID();

const users= [{
  _id: userOneId,
  firstname: "user1",
  lastname: "user1",
  email: 'benoit@example.com',
  password:'userOnePass',
  nbFalsePassword: 0,
  billing: 'Free',
  tokens:[{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.TOKEN_JWT_SECRET_TOKEN).toString(),
    tokendate: moment().add(7,'d').valueOf()
  }]
},{
  _id: userTwoId,
  firstname: "user2",
  lastname: "user2",
  email: 'agata@example.com',
  password: 'userTwoPass',
  nbFalsePassword: 0,
  billing: 'Free',
  tokens:[{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.TOKEN_JWT_SECRET_TOKEN).toString(),
    tokendate: moment().add(7,'d').valueOf()
  }]
},{
  _id: userThreeId,
  firstname: "user3",
  lastname: "user3",
  email: 'jenny@example.com',
  password: 'userThreePass',
  nbFalsePassword: 0,
  billing: 'Free',
  tokens:[{
    access: 'auth',
    token: jwt.sign({_id: userThreeId, access: 'auth'}, process.env.TOKEN_JWT_SECRET_TOKEN).toString(),
    tokendate: moment().add(7,'d').valueOf()
  }]
}];

const populateUsers = (done)=>{
  User.remove({}).then(()=>{
    const userOne = new User(users[0]).save();
    const userTwo = new User(users[1]).save();
    const userThree = new User(users[2]).save();

    return Promise.all([userOne, userTwo,userThree])
  }).then(()=>done());
};

module.exports={users, populateUsers};
