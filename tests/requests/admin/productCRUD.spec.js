/* eslint-env mocha */

const chai = require('chai')
chai.use(require('sinon-chai'))

const sinon = require('sinon')
const request = require('supertest')

const app = require('../../../app')
const helpers = require('../../../helpers')
const db = require('../../../models')

describe('# Admin Request', () => {
  context('# GET /admin and /admin/products', () => {
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

    it('Redirect to admin products page', (done) => {
      request(app)
        .get('/admin')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          done()
        })
    })

    it("Show user's own admin products page", (done) => {
      request(app)
        .get('/admin/products')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.text.should.include('管理系統')
          res.text.should.include('店家名稱：')
          res.text.should.include('您尚未建立任何商品。')
          done()
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.User.destroy({ where: {}, truncate: true })
    })
  })

  context('# GET /admin/products/create and POST /admin/products', () => {
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
      await db.CategoryLv1.destroy({ where: {}, truncate: true })
      await db.CategoryLv2.destroy({ where: {}, truncate: true })
      await db.CategoryLv3.destroy({ where: {}, truncate: true })
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
      await db.CategoryLv1.create({ id: 1, name: '1-1' })
      await db.CategoryLv2.create({ id: 1, name: '2-1' })
      await db.CategoryLv3.create({ id: 1, name: '3-1' })
      await db.CategoryLv3.create({ id: 2, name: '3-2' })
    })

    it('Display page for create a new product', (done) => {
      request(app)
        .get('/admin/products/create')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.text.should.include('新增產品資料')
          res.text.should.include('1-1')
          res.text.should.include('確認新增')
          return done()
        })
    })

    it('Redirect when name of product is null', (done) => {
      request(app)
        .post('/admin/products')
        .send({
          price: 100,
          description: 'nope',
          categoryLv1Id: 1,
          categoryLv2Id: 1,
          categoryLv3Id: 1
        })
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Product.findAll({ where: { UserId: 1 } }).then((products) => {
            products.push('None')
            products[0].should.be.equal('None') // 代表沒有新增product到陣列，陣列只有剛才新增的'None'
            return done()
          })
        })
    })

    it('Create a new product', (done) => {
      request(app)
        .post('/admin/products')
        .send({
          name: 'Test',
          price: 100,
          description: 'nope',
          categoryLv1Id: 1,
          categoryLv2Id: 1,
          categoryLv3Id: 2
        })
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Product.findByPk(1).then((product) => {
            product.name.should.be.equal('Test')
            product.price.should.be.equal(100)
            product.description.should.be.equal('nope')
            product.image.should.be.equal('https://fakeimg.pl/640x480/')
            product.CategoryLv1Id.should.be.equal(1)
            product.CategoryLv2Id.should.be.equal(1)
            product.CategoryLv3Id.should.be.equal(2)
            return done()
          })
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.User.destroy({ where: {}, truncate: true })
      await db.CategoryLv1.destroy({ where: {}, truncate: true })
      await db.CategoryLv2.destroy({ where: {}, truncate: true })
      await db.CategoryLv3.destroy({ where: {}, truncate: true })
      await db.Product.destroy({ where: {}, truncate: true })
    })
  })

  context('# GET /admin/products/:id/edit, POST /admin/products/:id, and DELETE /admin/products/:id ', () => {
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
      await db.CategoryLv1.destroy({ where: {}, truncate: true })
      await db.CategoryLv2.destroy({ where: {}, truncate: true })
      await db.CategoryLv3.destroy({ where: {}, truncate: true })
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
      await db.CategoryLv1.create({ id: 1, name: '1-1' })
      await db.CategoryLv2.create({ id: 1, name: '2-1' })
      await db.CategoryLv3.create({ id: 1, name: '3-1' })
      await db.CategoryLv3.create({ id: 2, name: '3-2' })
      await db.Product.create({
        id: 1,
        name: 'Test1',
        price: 987,
        description: 'null',
        CategoryLv1Id: 1,
        CategoryLv2Id: 1,
        CategoryLv3Id: 2,
        UserId: 1
      })
      await db.Product.create({
        id: 2,
        name: 'Test2',
        price: 654,
        description: 'none',
        CategoryLv1Id: 1,
        CategoryLv2Id: 1,
        CategoryLv3Id: 1,
        UserId: 2,
        forSale: 0
      })
    })

    it("Redirect when attempting to edit other's product Test2", (done) => {
      request(app)
        .get('/admin/products/2/edit')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          return done()
        })
    })

    it('Display page for editing a specific product', (done) => {
      request(app)
        .get('/admin/products/1/edit')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          res.text.should.include('修改產品資料')
          res.text.should.include('Test1')
          res.text.should.include(987)
          res.text.should.include('null')
          res.text.should.include('1-1')
          res.text.should.include('2-1')
          res.text.should.include('3-2')
          res.text.should.include('確認修改')
          return done()
        })
    })

    it('Redirect when name of product is null', (done) => {
      request(app)
        .put('/admin/products/1')
        .send({
          price: 100,
          description: 'nope',
          CategoryLv1Id: 1,
          CategoryLv2Id: 1,
          CategoryLv3Id: 1
        })
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Product.findByPk(1).then((product) => {
            product.price.should.be.equal(987)
            product.description.should.be.equal('null')
            product.CategoryLv3Id.should.be.equal(2)
            return done()
          })
        })
    })

    it("Redirect when attempting to edit other's product Test2", (done) => {
      request(app)
        .put('/admin/products/2')
        .send({
          name: 'Tested',
          price: 100,
          description: 'nope',
          CategoryLv1Id: 1,
          CategoryLv2Id: 1,
          CategoryLv3Id: 2
        })
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Product.findByPk(2).then((product) => {
            // 確認資料沒被竄改
            product.name.should.be.equal('Test2')
            product.price.should.be.equal(654)
            product.description.should.be.equal('none')
            product.CategoryLv3Id.should.be.equal(1)
            return done()
          })
        })
    })

    it('Edit a specific product', (done) => {
      request(app)
        .put('/admin/products/1')
        .send({
          name: 'Test',
          price: 100,
          description: 'nope',
          CategoryLv1Id: 1,
          CategoryLv2Id: 1,
          CategoryLv3Id: 2
        })
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Product.findByPk(1).then((product) => {
            product.name.should.be.equal('Test')
            product.price.should.be.equal(100)
            product.description.should.be.equal('nope')
            product.CategoryLv3Id.should.be.equal(2)
            return done()
          })
        })
    })

    it('Delete a specific product', (done) => {
      request(app)
        .delete('/admin/products/1')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Product.findAll({ where: { UserId: 1 } }).then((products) => {
            products.push('None')
            products[0].should.be.equal('None') // 代表沒有新增product到陣列，陣列只有剛才新增的'None'
            return done()
          })
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.User.destroy({ where: {}, truncate: true })
      await db.CategoryLv1.destroy({ where: {}, truncate: true })
      await db.CategoryLv2.destroy({ where: {}, truncate: true })
      await db.CategoryLv3.destroy({ where: {}, truncate: true })
      await db.Product.destroy({ where: {}, truncate: true })
    })
  })
})
