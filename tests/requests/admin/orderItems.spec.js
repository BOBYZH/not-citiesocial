/* eslint-env mocha */

const chai = require('chai')
chai.use(require('sinon-chai'))
const should = chai.should() // 定義在最先跑的spec.js，所有requests代碼中的should才有作用

const sinon = require('sinon')
const request = require('supertest')

const app = require('../../../app')
const helpers = require('../../../helpers')
const db = require('../../../models')

describe('# Admin Request', () => {
  context('# GET /admin/orderItems', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({
        id: 1,
        isAdmin: 1,
        shopName: 'Test Shop'
      })
      await db.User.destroy({ where: {}, truncate: true })
      await db.Product.destroy({ where: {}, truncate: true })
      await db.User.create({
        id: 1,
        firstName: 'Test',
        lastName: 'Admin',
        email: 'test@example.com',
        password: '123456',
        isAdmin: 1,
        shopName: 'Test Shop'
      })
    })

    it("Show user's own admin orderItems page", (done) => {
      request(app)
        .get('/admin/orderItems')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.text.should.include('管理系統')
          res.text.should.include('店家名稱：')
          res.text.should.include('你還沒有訂單資料')
          done()
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.User.destroy({ where: {}, truncate: true })
    })
  })

  context('# POST /admin/orderItems/:id/confirm', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({
        id: 1,
        isAdmin: 1,
        shopName: 'Test Shop'
      })
      await db.User.destroy({ where: {}, truncate: true })
      await db.Product.destroy({ where: {}, truncate: true })
      await db.Order.destroy({ where: {}, truncate: true })
      await db.OrderItem.destroy({ where: {}, truncate: true })
      await db.User.create({
        id: 1,
        firstName: 'Test1',
        lastName: 'Admin',
        email: 'test@example.com',
        isAdmin: 1,
        shopName: 'Test Shop1'
      })
      await db.User.create({
        id: 2,
        firstName: 'Test2',
        lastName: 'Admin',
        email: 'test@example.com',
        isAdmin: 1,
        shopName: 'Test Shop2'
      })
      await db.Product.create({
        name: 'Test1',
        price: 250,
        description: 'null',
        CategoryLv1Id: 1,
        CategoryLv2Id: 2,
        CategoryLv3Id: 3,
        UserId: 1
      })
      await db.Product.create({
        name: 'Test2',
        price: 250,
        description: 'null',
        CategoryLv1Id: 1,
        CategoryLv2Id: 2,
        CategoryLv3Id: 3,
        UserId: 2
      })
      await db.Order.create({
        name: ('User Test 1-1'),
        address: 'test address',
        phone: '09123445678',
        paymentStatus: '0',
        email: 'test@test.com'
      })
      await db.Order.create({
        name: ('User Test 1-2'),
        address: 'test address',
        phone: '09123445678',
        paymentStatus: '0',
        email: 'test@test.com'
      })
      await db.OrderItem.create({
        OrderId: 1,
        ProductId: 1,
        price: 250,
        quantity: 3,
        subtotal: 750,
        shippingStatus: 0
      })
      await db.OrderItem.create({
        OrderId: 2,
        ProductId: 2,
        price: 300,
        quantity: 3,
        subtotal: 900,
        shippingStatus: 0
      })
    })

    it('Mark specific orderItem as shipped', (done) => {
      request(app)
        .post('/admin/orderItems/1/confirm')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.OrderItem.findByPk(1).then((orderItem) => {
            orderItem.shippingStatus.should.be.equal(1)
          })
          done()
        })
    })

    it('Redirect when attempting to mark orderItem from other shop as shipped', (done) => {
      request(app)
        .post('/admin/orderItems/2/confirm')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.OrderItem.findByPk(2).then((orderItem) => {
            orderItem.shippingStatus.should.not.be.equal(1)
          })
          done()
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.User.destroy({ where: {}, truncate: true })
      await db.Product.destroy({ where: {}, truncate: true })
      await db.Order.destroy({ where: {}, truncate: true })
      await db.OrderItem.destroy({ where: {}, truncate: true })
    })
  })
})
