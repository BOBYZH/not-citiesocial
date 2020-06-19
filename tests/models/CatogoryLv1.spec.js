/* eslint-env mocha */

const chai = require('chai')
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers')

const db = require('../../models')
const CategoryLv1Model = require('../../models/categorylv1')

describe('# CategoryLv1 Model', () => {
  before((done) => {
    done()
  })

  const CategoryLv1 = CategoryLv1Model(sequelize, dataTypes)
  const categoryLv1 = new CategoryLv1()
  checkModelName(CategoryLv1)('CategoryLv1')

  context('properties', () => {
    ['name'].forEach(checkPropertyExists(categoryLv1))
  })

  context('associations', () => {
    const Product = 'Product'

    before(() => {
      CategoryLv1.associate({ Product })
    })

    it('should have many products', (done) => {
      expect(CategoryLv1.hasMany).to.have.been.calledWith(Product)
      done()
    })
  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.CategoryLv1.create({
        name: '測試Lv1'
      }).then((categoryLv1) => {
        data = categoryLv1
        done()
      })
    })
    it('read', (done) => {
      db.CategoryLv1.findByPk(data.id).then((categoryLv1) => {
        expect(data.id).to.be.equal(categoryLv1.id)
        done()
      })
    })
    it('update', (done) => {
      db.CategoryLv1.update({}, { where: { id: data.id } }).then(() => {
        db.CategoryLv1.findByPk(data.id).then((categoryLv1) => {
          expect(data.updatedAt).to.be.not.equal(categoryLv1.updatedAt)
          done()
        })
      })
    })
    it('delete', (done) => {
      db.CategoryLv1.destroy({ where: { id: data.id } }).then(() => {
        db.CategoryLv1.findByPk(data.id).then((categoryLv1) => {
          expect(categoryLv1).to.be.equal(null)
          done()
        })
      })
    })
  })
})
