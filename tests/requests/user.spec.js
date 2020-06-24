/* eslint-env mocha */

const chai = require('chai')
chai.use(require('sinon-chai'))

const sinon = require('sinon')
const request = require('supertest')

const app = require('../../app')
const helpers = require('../../helpers')
const db = require('../../models')

describe('# User Request', () => {
  context('# GET /users/:id', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({ id: 1 })
      await db.User.destroy({ where: {}, truncate: true })
      await db.User.create({
        id: 1,
        firstName: 'Test',
        lastName: 'Admin',
        email: 'test@example.com',
        password: '123456',
        isAdmin: 1
      })
      await db.User.create({})
    })

    it("Show user's default page", (done) => {
      request(app)
        .get('/users/1')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          res.text.should.include('會員 Insider')
          return done()
        })
    })

    it("Redirect to user's own page", (done) => {
      request(app)
        .get('/users/2')
        .set('Accept', 'application/json')
        .expect(302)
        .end(function (err, res) {
          if (err) return done(err)
          return done()
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.User.destroy({ where: {}, truncate: true })
    })
  })

  context('# GET /users/:id/edit', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({ id: 1 })

      await db.User.destroy({ where: {}, truncate: true })
      await db.User.create({})
    })

    it("Show user's edit page", (done) => {
      request(app)
        .get('/users/1/edit')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          res.text.should.include('更新會員資料')
          return done()
        })
    })

    it("Redirect to user's own edit page", (done) => {
      request(app)
        .get('/users/2/edit')
        .set('Accept', 'application/json')
        .expect(302)
        .end(function (err, res) {
          if (err) return done(err)
          return done()
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.User.destroy({ where: {}, truncate: true })
    })
  })

  context('# PUT /users/:id', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({ id: 1 })
      await db.User.create({})
      await db.User.create({
        id: 2,
        firstName: 'Test2',
        lastName: 'User',
        email: 'test2@example.com',
        password: '123456',
        isAdmin: 0
      })
    })

    it('Update own profile', (done) => {
      request(app)
        .put('/users/1')
        .send({
          firstName: 'Testing',
          lastName: 'User',
          defaultPhone: '0987654321',
          defaultAddress: 'TestAddress',
          isAdmin: 0
        })
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.User.findByPk(1).then((user) => {
            user.firstName.should.be.equal('Testing')
            user.lastName.should.be.equal('User')
            user.defaultPhone.should.be.equal('0987654321')
            user.defaultAddress.should.be.equal('TestAddress')
            user.isAdmin.should.be.equal(false)
            return done()
          })
        })
    })

    it('Redirect to prevent from illegal action', (done) => {
      request(app)
        .put('/users/2')
        .send({
          firstName: 'Testing',
          lastName: 'Admin',
          isAdmin: 1
        })
        .set('Accept', 'application/json')
        .expect(302)
        .end(function (err, res) {
          if (err) return done(err)
          db.User.findByPk(2).then((user) => { // 驗證資料沒被竄改
            user.firstName.should.be.equal('Test2')
            user.lastName.should.be.equal('User')
            user.isAdmin.should.be.equal(false)
            return done()
          })
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.User.destroy({ where: {}, truncate: true })
    })
  })
})
