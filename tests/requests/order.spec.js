/* eslint-env mocha */

const chai = require('chai')
chai.use(require('sinon-chai'))

const sinon = require('sinon')
const request = require('supertest')

const app = require('../../app')
const helpers = require('../../helpers')
const db = require('../../models')

describe('# Order Request', () => {
  context('# GET /orders', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({ id: 1 })
      await db.User.destroy({ where: {}, truncate: true })
      await db.Order.destroy({ where: {}, truncate: true })
      await db.User.create({})
      await db.Order.create({})
    })

    it("Show user's own orders page", (done) => {
      request(app)
        .get('/orders')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.text.should.include('你還沒有訂單資料')
          done()
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.User.destroy({ where: {}, truncate: true })
      await db.Order.destroy({ where: {}, truncate: true })
    })
  })

  context('# POST /order', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({ id: 1 })
      this.cartId = sinon.stub(
        helpers, 'cartId'
      ).returns(1)
      await db.User.destroy({ where: {}, truncate: true })
      await db.Product.destroy({ where: {}, truncate: true })
      await db.Cart.destroy({ where: {}, truncate: true })
      await db.CartItem.destroy({ where: {}, truncate: true })
      await db.User.create({
        firstName: 'Test',
        lastName: 'Admin',
        email: 'test@example.com',
        password: '123456',
        isAdmin: 1
      })
      await db.Product.create({
        name: 'Test',
        price: 250,
        description: 'null',
        CategoryLv1Id: 1,
        CategoryLv2Id: 2,
        CategoryLv3Id: 3,
        UserId: 1
      })
      await db.Product.create({
        name: 'Test2',
        price: 300,
        description: 'nope',
        CategoryLv1Id: 3,
        CategoryLv2Id: 2,
        CategoryLv3Id: 1,
        UserId: 1
      })
      await db.Cart.create({})
      await db.CartItem.create({
        CartId: 1,
        ProductId: 1,
        quantity: 4
      })
      await db.CartItem.create({
        CartId: 1,
        ProductId: 2,
        quantity: 3
      })
    })

    it('Create a new order with orderItem(s)', (done) => {
      request(app)
        .post('/order')
        .send({
          firstName: 'Test',
          lastName: 'User',
          address: 'test address',
          phone: '09123445678',
          email: 'test@test.com',
          paymentStatus: '0',
          amount: 1000
        })
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Order.findOne({ where: { UserId: 1 } }).then((order) => {
            order.name.should.be.equal('User Test')
            order.address.should.be.equal('test address')
            order.phone.should.be.equal('09123445678')
            order.paymentStatus.should.be.equal('0')
            order.email.should.be.equal('test@test.com')
          })
          db.OrderItem.findAll({ where: { OrderId: 1 } }).then((orderItems) => {
            orderItems = orderItems.sort((a, b) => a.price - b.price)
            orderItems[0].ProductId.should.be.equal(1)
            orderItems[0].price.should.be.equal(250)
            orderItems[0].quantity.should.be.equal(4)
            orderItems[0].subtotal.should.be.equal(1000)
            orderItems[0].shippingStatus.should.be.equal(0)
            orderItems[1].ProductId.should.be.equal(2)
            orderItems[1].price.should.be.equal(300)
            orderItems[1].quantity.should.be.equal(3)
            orderItems[1].subtotal.should.be.equal(900)
            orderItems[1].shippingStatus.should.be.equal(0)
            return done()
          })
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      this.cartId.restore()
      await db.User.destroy({ where: {}, truncate: true })
      await db.Product.destroy({ where: {}, truncate: true })
      await db.Cart.destroy({ where: {}, truncate: true })
      await db.CartItem.destroy({ where: {}, truncate: true })
      await db.Order.destroy({ where: {}, truncate: true })
      await db.OrderItem.destroy({ where: {}, truncate: true })
    })
  })

  context('# POST /order/:id/cancel', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({ id: 1 })
      await db.User.destroy({ where: {}, truncate: true })
      await db.Order.destroy({ where: {}, truncate: true })
      await db.User.create({})
      await db.User.create({})
      await db.Order.create({
        UserId: 1,
        name: ('User Test1'),
        address: 'test address',
        phone: '09123445678',
        paymentStatus: '0',
        email: 'test1@test.com'
      })
      await db.Order.create({
        UserId: 2,
        name: ('User Test2'),
        address: 'test address',
        phone: '09123445678',
        paymentStatus: '0',
        email: 'test2@test.com'
      })
    })

    it("Cancel user's specific order", (done) => {
      request(app)
        .post('/order/1/cancel')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Order.findByPk(1).then((order) => {
            order.paymentStatus.should.be.equal('-1')
          })
          done()
        })
    })

    it("Redirect when attempting to cancel other's order", (done) => {
      request(app)
        .post('/order/2/cancel')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Order.findByPk(2).then((order) => {
            order.paymentStatus.should.not.be.equal('-1')
          })
          done()
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.User.destroy({ where: {}, truncate: true })
      await db.Order.destroy({ where: {}, truncate: true })
    })
  })

  context('# GET /order/:id/payment', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({ id: 1 })
      await db.User.destroy({ where: {}, truncate: true })
      await db.Order.destroy({ where: {}, truncate: true })
      await db.User.create({})
      await db.User.create({})
      await db.Order.create({
        UserId: 1,
        name: ('User1 Test'),
        address: 'test1 address',
        phone: '09123445678',
        paymentStatus: '0',
        email: 'test1@test.com'
      })
      await db.Order.create({
        UserId: 2,
        name: ('User2 Test'),
        address: 'test2 address',
        phone: '09123445678',
        paymentStatus: '0',
        email: 'test2@test.com'
      })
    })

    it("Display payment page of user's specific order", (done) => {
      request(app)
        .get('/order/1/payment')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.text.should.include('付款方式')
          done()
        })
    })

    it("Show warning message when displaying other's payment page", (done) => {
      request(app)
        .get('/order/2/payment')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          done()
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.User.destroy({ where: {}, truncate: true })
      await db.Order.destroy({ where: {}, truncate: true })
    })
  })
})
