const expect = require('expect');
const request= require('supertest');
const {ObjectID} = require('mongodb');

const {app}= require('./../server');
const {User}= require('./../models/user')
const {users, populateUsers}= require('./seed/seed');

beforeEach(populateUsers);

describe('GET /users/me',()=>{
  it('should return user if authenticated', (done)=>{
    request(app).get('/users/me').set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it('should return a 400 if not authenticated', (done)=>{
    request(app).get('/users/me')
      .expect(400)
      .expect((res)=>{
        expect(res.body).toEqual({});
      })
      .end(done)
  });
  it('should reject connexion and remove token if token expired', (done)=>{
    User.findById(users[2]._id).then((user)=>{
      user.tokens[0].tokendate= 123;
      user.save().then(()=>{
        request(app).get('/users/me').set('x-auth', users[2].tokens[0].token)
          .expect(403)
          .expect((res)=>{
            expect(res.headers['x-auth']).toNotExist();
            expect(res.headers['x-auth-date']).toNotExist();
            expect(res.headers['h-auth']).toNotExist();
          })
          .end((err, res)=>{
            if(err){
              return done(err)
            }
            User.findById(users[2]._id).then((user)=>{
              expect(user.tokens).toEqual([]);
              done();
            }).catch((e)=>done(e))
          })
      })
    }).catch((e)=>done(e))
  })
});

describe('POST /users', ()=>{
  it('should create a user', (done)=>{
    var firstname= 'Ben';
    var lastname = 'Goup';
    var email = 'example@example.com';
    var password= '123mad';

    request(app).post('/users').send({email, password, firstname, lastname})
      .expect(200)
      .expect((res)=>{
        expect(res.headers['x-auth']).toExist();
        expect(res.headers['x-auth-date']).toExist();
        expect(res.headers['h-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err)=>{
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user)=>{
          expect(user).toExist();
          expect(user.passwor).toNotBe(password);
          done();
        }).catch((e)=> done(e));
      })
  });
  it('should validation error if request invalid', (done)=>{
    request(app).post('/users').send({email: 'example.com', password: ' de ', firstname: 'hello', lastname: 'hello'})
      .expect(400)
      .end(done)
  });
  it('should not create user if email in use', (done)=>{
    request(app).post('/users').send({email: users[0].email, password:users[0].password, firstname: 'hello', lastname: 'hello'})
      .expect(400)
      .end(done)
  });
});

describe('POST /users/login', ()=>{
  it('should login user and return auth token', (done)=>{
    request(app).post('/users/login').send({email: users[1].email, password: users[1].password})
      .expect(200)
      .expect((res)=>{
        expect(res.headers['x-auth']).toExist();
        expect(res.headers['h-auth']).toExist();
        expect(res.headers['x-auth-date']).toExist();
      })
      .end((err, res)=>{
        if (err) {
          return done (err);
        }

        User.findById(users[1]._id).then((user)=>{
          expect(user.tokens[1]).toInclude({access: 'auth',token: res.headers['x-auth']});
          done();
        }).catch((e)=> done(e));
      })
  });

  it('should reject invalid login', (done)=>{
    request(app).post('/users/login').send({email: users[1].email, password: 'password'})
      .expect(401)
      .expect((res)=>{
        expect(res.headers['x-auth']).toNotExist();
        expect(res.headers['x-auth-date']).toNotExist();
        expect(res.headers['h-auth']).toNotExist();
      })
      .end((err, res)=>{
        if (err) {
          return done (err);
        }

        User.findById(users[1]._id).then((user)=>{
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e)=> done(e));
      })
  });
  it('should block user after 3 failed attempt', (done)=>{
    User.findById(users[2]._id).then((user)=>{
      user.nbFalsePassword= 4;
      user.save().then(()=>{
        request(app).post('/users/login').send({email: users[2].email, password: users[2].password})
          .expect(423)
          .expect((res)=>{
            expect(res.headers['x-auth']).toNotExist();
            expect(res.headers['x-auth-date']).toNotExist();
            expect(res.headers['h-auth']).toNotExist();
          })
          .end(done)
      })
    }).catch((e)=>done(e))
  })
});

describe('DELETE /users/me/token', ()=>{
  it('should remove auth token on logout', (done)=>{
    request(app).delete('/users/me/token').set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res)=>{
        if (err) {
          return done (err);
        }

        User.findById(users[0]._id).then((user)=>{
          expect(user.tokens).toEqual([]);
          done();
        }).catch((e)=> done(e));
      })
  });
});

describe('POST /users/token', ()=>{
  it('should send a new token, tokendate', (done)=>{
    request(app).post('/users/token').set('x-auth', users[2].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.headers['x-auth']).toExist();
        expect(res.headers['x-auth']).toNotEqual(users[2].tokens[0].token);
        expect(res.headers['x-auth-date']).toExist();
        expect(res.headers['x-auth-date']).toNotEqual(users[2].tokens[0].tokendate);
      })
      .end((err, res)=>{
        if (err) {
          return done (err);
        }

        User.findById(users[2]._id).then((user)=>{
          expect(user.tokens[0]).toInclude({access: 'auth',token: res.headers['x-auth'], tokendate: res.headers['x-auth-date'] });
          expect(user.tokens[0].tokendate).toNotEqual(users[2].tokens[0].tokendate);
          done();
        }).catch((e)=> done(e));
      })
  });

  it('should reject invalid request', (done)=>{
    request(app).post('/users/token').set('h-auth', 'hello')
      .expect(400)
      .expect((res)=>{
        expect(res.headers['x-auth']).toNotExist();
        expect(res.headers['h-auth']).toNotExist();
        expect(res.headers['x-auth-date']).toNotExist();
      })
      .end(done)
  });

  it('should reject connexion and remove token if expired', (done)=>{
    User.findById(users[0]._id).then((user)=>{
      user.tokens[0].headtokendate= 123;
      user.save().then(()=>{
        request(app).post('/users/token').set('h-auth', users[0].tokens[0].headtoken)
          .expect(403)
          .expect((res)=>{
            expect(res.headers['x-auth']).toNotExist();
            expect(res.headers['x-auth-date']).toNotExist();
            expect(res.headers['h-auth']).toNotExist();
          })
          .end((err, res)=>{
            if(err){
              return done(err)
            }
            User.findById(users[0]._id).then((user)=>{
              expect(user.tokens).toEqual([]);
              done();
            }).catch((e)=>done(e))
          })
      })
    }).catch((e)=>done(e))
  })

});
