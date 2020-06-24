/* eslint-env mocha */

const chai = require('chai')
chai.use(require('sinon-chai'))

const request = require('supertest')

const app = require('../../app')
const db = require('../../models')

describe('# Product Request', () => {
  context('# All *', () => {
    it('Redirect illegal url to index page', (done) => {
      request(app)
        .get('/illegalUrl') // 未定義的路由
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          done()
        })
    })
  })

  context('# GET / and /products', () => {
    before(async () => {
      await db.Product.destroy({ where: {}, truncate: true })
      await db.CategoryLv1.destroy({ where: {}, truncate: true })
      await db.CategoryLv2.destroy({ where: {}, truncate: true })
      await db.CategoryLv3.destroy({ where: {}, truncate: true })
      await db.User.destroy({ where: {}, truncate: true })
      await db.User.create({
        firstName: 'Test1',
        lastName: 'Admin',
        email: 'test1@example.com',
        password: '123456',
        isAdmin: 1,
        shopName: 'Open'
      })
      await db.User.create({
        firstName: 'Test2',
        lastName: 'Admin',
        email: 'test2@example.com',
        password: '123456',
        isAdmin: 0,
        shopName: 'Closed'
      })
      await db.CategoryLv1.create({ id: 1, name: 'null' })
      await db.CategoryLv1.create({ id: 2, name: 'null' })
      await db.CategoryLv2.create({ id: 1, name: 'null' })
      await db.CategoryLv2.create({ id: 2, name: 'null' })
      await db.CategoryLv3.create({ id: 1, name: 'null' })
      await db.CategoryLv3.create({ id: 2, name: 'null' })
      await db.Product.create({
        name: 'Test1 is a simple sample for testing index page',
        price: 987,
        description: 'null',
        CategoryLv1Id: 1,
        CategoryLv2Id: 2,
        CategoryLv3Id: 2,
        UserId: 1,
        forSale: 1
      })
      await db.Product.create({
        name: 'Test2',
        price: 654,
        description: 'null',
        CategoryLv1Id: 1,
        CategoryLv2Id: 2,
        CategoryLv3Id: 1,
        UserId: 1,
        forSale: 0
      })
      await db.Product.create({
        name: 'Test2',
        price: 321,
        description: 'null',
        CategoryLv1Id: 1,
        CategoryLv2Id: 1,
        CategoryLv3Id: 2,
        UserId: 2
      })
      await db.Product.create({
        name: 'Test4',
        price: 1000,
        description: 'null',
        CategoryLv1Id: 2,
        CategoryLv2Id: 1,
        CategoryLv3Id: 1,
        UserId: 1,
        forSale: 1
      })
    })

    it('Show index page with product(s) ready for sale', (done) => {
      request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.text.should.include('限時閃購商品 － 全台獨家優惠')
          res.text.should.include('Test1 is a simple')
          res.text.should.include('Test4')
          res.text.should.include('...')
          res.text.should.not.include('Test2')
          res.text.should.not.include('Test3')
          done()
        })
    })

    it('Show products page with all products ready for sale', (done) => {
      request(app)
        .get('/products')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.text.should.include('商品(2)')
          res.text.should.include('Test1 is a simple')
          res.text.should.include('Test4')
          res.text.should.not.include('Test2')
          res.text.should.not.include('Test3')
          done()
        })
    })

    it('Show product(s) as corresponding result(s) after searching', (done) => {
      request(app)
        .get('/products/?keyword=test1')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.text.should.include('商品(1)')
          res.text.should.include('Test1 is a simple')
          res.text.should.not.include('Test2')
          res.text.should.not.include('Test3')
          res.text.should.not.include('Test4')
          done()
        })
    })

    it('Show product(s) as corresponding result(s) belonging to specific categoryLv1', (done) => {
      request(app)
        .get('/products?categoryLv1Id=1')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.text.should.include('商品(1)')
          res.text.should.include('Test1 is a simple')
          res.text.should.not.include('Test2')
          res.text.should.not.include('Test3')
          res.text.should.not.include('Test4')
          done()
        })
    })

    after(async () => {
      await db.Product.destroy({ where: {}, truncate: true })
      await db.CategoryLv1.destroy({ where: {}, truncate: true })
      await db.CategoryLv2.destroy({ where: {}, truncate: true })
      await db.CategoryLv3.destroy({ where: {}, truncate: true })
      await db.User.destroy({ where: {}, truncate: true })
    })
  })

  context('# GET /products/:id', () => {
    before(async () => {
      await db.Product.destroy({ where: {}, truncate: true })
      await db.CategoryLv1.destroy({ where: {}, truncate: true })
      await db.CategoryLv2.destroy({ where: {}, truncate: true })
      await db.CategoryLv3.destroy({ where: {}, truncate: true })
      await db.User.destroy({ where: {}, truncate: true })
      await db.User.create({
        firstName: 'Test1',
        lastName: 'Admin',
        email: 'test@example.com',
        password: '123456',
        isAdmin: 1,
        shopName: 'Open'
      })
      await db.User.create({
        firstName: 'Test2',
        lastName: 'Admin',
        email: 'test@example.com',
        password: '123456',
        isAdmin: 0,
        shopName: 'Closed'
      })
      await db.CategoryLv1.create({})
      await db.CategoryLv2.create({})
      await db.CategoryLv3.create({})
      await db.Product.create({
        name: 'Testing1',
        price: 777,
        description: 'Bingo!',
        features: 'none',
        CategoryLv1Id: 1,
        CategoryLv2Id: 1,
        CategoryLv3Id: 1,
        UserId: 1,
        forSale: 1
      })
      await db.Product.create({
        name: 'Testing2',
        price: 666,
        description: 'Nope',
        features: 'none',
        CategoryLv1Id: 1,
        CategoryLv2Id: 1,
        CategoryLv3Id: 1,
        UserId: 1,
        forSale: 0
      })
      await db.Product.create({
        name: 'Testing3',
        price: 1,
        description: 'No',
        features: 'none',
        CategoryLv1Id: 1,
        CategoryLv2Id: 1,
        CategoryLv3Id: 1,
        UserId: 2,
        forSale: 1
      })
    })

    it('Show single product description page for buying', (done) => {
      request(app)
        .get('/products/1')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.text.should.include('Testing1')
          res.text.should.include('產品介紹')
          res.text.should.include('Bingo!')
          res.text.should.include('產品特色')
          res.text.should.include('none')
          res.text.should.include('NTD 777')
          res.text.should.include('加入購物車')
          res.text.should.not.include('使用說明')
          res.text.should.not.include('商品規格')
          done()
        })
    })

    it('Redirect for nonexistent product', (done) => {
      request(app)
        .get('/products/10')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          done()
        })
    })

    it('Redirect for product not for sale', (done) => {
      request(app)
        .get('/products/2')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          done()
        })
    })

    it('Redirect for product which shop is closed', (done) => {
      request(app)
        .get('/products/3')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          done()
        })
    })

    after(async () => {
      await db.Product.destroy({ where: {}, truncate: true })
      await db.CategoryLv1.destroy({ where: {}, truncate: true })
      await db.CategoryLv2.destroy({ where: {}, truncate: true })
      await db.CategoryLv3.destroy({ where: {}, truncate: true })
      await db.User.destroy({ where: {}, truncate: true })
    })
  })
})
