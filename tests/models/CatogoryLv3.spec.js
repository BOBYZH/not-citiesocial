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
const CategoryLv3Model = require('../../models/categorylv3')

describe('# CategoryLv3 Model', () => {
  before((done) => {
    done()
  })

  const CategoryLv3 = CategoryLv3Model(sequelize, dataTypes)
  const categoryLv3 = new CategoryLv3()
  checkModelName(CategoryLv3)('CategoryLv3')

  context('properties', () => {
    ['name'].forEach(checkPropertyExists(categoryLv3))
  })

  context('associations', () => {
    const Product = 'Product'

    before(() => {
      CategoryLv3.associate({ Product })
    })

    it('should have many products', (done) => {
      expect(CategoryLv3.hasMany).to.have.been.calledWith(Product)
      done()
    })
  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.CategoryLv3.create({
        name: '測試Lv3'
      }).then((categoryLv3) => {
        data = categoryLv3
        done()
      })
    })
    it('read', (done) => {
      db.CategoryLv3.findByPk(data.id).then((categoryLv3) => {
        expect(data.id).to.be.equal(categoryLv3.id)
        done()
      })
    })
    it('update', (done) => {
      db.CategoryLv3.update({}, { where: { id: data.id } }).then(() => {
        db.CategoryLv3.findByPk(data.id).then((categoryLv3) => {
          expect(data.updatedAt).to.be.not.equal(categoryLv3.updatedAt)
          done()
        })
      })
    })
    it('delete', (done) => {
      db.CategoryLv3.destroy({ where: { id: data.id } }).then(() => {
        db.CategoryLv3.findByPk(data.id).then((categoryLv3) => {
          expect(categoryLv3).to.be.equal(null)
          done()
        })
      })
    })
  })
})
