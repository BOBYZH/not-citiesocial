/* eslint-env mocha */

const chai = require('chai')
chai.use(require('sinon-chai'))
const should = chai.should()

const sinon = require('sinon')
const request = require('supertest')

const app = require('../../app')
const helpers = require('../../helpers')
const db = require('../../models')

describe('# Cart Request', () => {
  context('# GET /cart', () => {
    it('Show default clean cart page', (done) => {
      request(app)
        .get('/cart')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.text.should.include('您還沒有加入商品到購物車中')
          done()
        })
    })
  })

  context('# POST /cart', () => {
    before(async () => {
      this.productId = sinon.stub(
        helpers, 'productId'
      ).returns(1)
      this.setQuantity = sinon.stub(
        helpers, 'setQuantity'
      ).returns(1)
      await db.User.destroy({ where: {}, truncate: true })
      await db.Product.destroy({ where: {}, truncate: true })
      await db.User.create({
        firstName: 'Test',
        lastName: 'Admin',
        email: 'test@example.com',
        password: '123456',
        isAdmin: 1
      })
      db.Product.create({
        name: 'Test',
        price: 250,
        description: 'null',
        CategoryLv1Id: 1,
        CategoryLv2Id: 2,
        CategoryLv3Id: 3,
        UserId: 1
      })
    })

    it('Create a new cart with a cartItem', (done) => {
      request(app)
        .post('/cart')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Cart.findAll().then((carts) => {
            db.CartItem.findOne({ where: { cartId: carts[0].id } }).then((cartItem) => {
              cartItem.ProductId.should.be.equal(1)
              cartItem.quantity.should.be.equal(1)
              return done()
            })
          })
        })
    })

    after(async () => {
      this.productId.restore()
      this.setQuantity.restore()
      await db.User.destroy({ where: {}, truncate: true })
      await db.Product.destroy({ where: {}, truncate: true })
      await db.Cart.destroy({ where: {}, truncate: true })
      await db.CartItem.destroy({ where: {}, truncate: true })
    })
  })

  context('# POST /cartItem/:id/add', () => {
    before(async () => {
      await db.Cart.destroy({ where: {}, truncate: true })
      await db.CartItem.destroy({ where: {}, truncate: true })
      await db.Cart.create({})
      await db.CartItem.create({
        CartId: 1,
        ProductId: 1,
        quantity: 1
      })

      it('Increase the quantity of cartItem', (done) => {
        request(app)
          .post('/cartItem/1/add')
          .set('Accept', 'application/json')
          .expect(302)
          .end((err, res) => {
            if (err) return done(err)
            db.CartItem.findByPk(1).then((cartItem) => {
              cartItem.quantity.should.be.equal(2)
            })
            done()
          })
      })

      after(async () => {
        await db.Cart.destroy({ where: {}, truncate: true })
        await db.CartItem.destroy({ where: {}, truncate: true })
      })
    })
  })

  context('# POST /cartItem/:id/sub', () => {
    before(async () => {
      await db.Cart.destroy({ where: {}, truncate: true })
      await db.CartItem.destroy({ where: {}, truncate: true })
      await db.Cart.create({})
      await db.CartItem.create({
        CartId: 1,
        ProductId: 1,
        quantity: 2
      })

      it('Increase the quantity of cartItem', (done) => {
        request(app)
          .post('/cartItem/1/sub')
          .set('Accept', 'application/json')
          .expect(302)
          .end((err, res) => {
            if (err) return done(err)
            db.CartItem.findByPk(1).then((cartItem) => {
              cartItem.quantity.should.be.equal(1)
            })
            done()
          })
      })

      after(async () => {
        await db.Cart.destroy({ where: {}, truncate: true })
        await db.CartItem.destroy({ where: {}, truncate: true })
      })
    })
  })

  context('# DELETE /cartItem/:id', () => {
    before(async () => {
      await db.Cart.destroy({ where: {}, truncate: true })
      await db.CartItem.destroy({ where: {}, truncate: true })
      await db.Cart.create({})
      await db.CartItem.create({
        CartId: 1,
        ProductId: 1,
        quantity: 2
      })
    })

    it('Delete specific cartItem', (done) => {
      request(app)
        .delete('/cartItem/1')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.CartItem.findAll().then((cartItems) => {
            // cartItems因cartItem被刪除內容為空，新插入的內容必然在陣列的第一個
            cartItems.push('none')
            cartItems[0].should.be.equal('none')
          })
          done()
        })
    })

    after(async () => {
      await db.Cart.destroy({ where: {}, truncate: true })
      await db.CartItem.destroy({ where: {}, truncate: true })
    })
  })
})
