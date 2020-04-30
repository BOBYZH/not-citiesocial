'use strict'

const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.bulkInsert('CategoryLv1s',
      [
        '居家',
        '家電',
        '科技新創',
        '鞋包配件',
        '媽咪寶貝',
        '運動戶外'
      ]
        .map((item, index) =>
          ({
            id: index + 1,
            name: item,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        ), {})

    queryInterface.bulkInsert('CategoryLv2s',
      Array.from({ length: 24 }) // 簡化該層級model數量，詳見admin/create.hbs理的說明
        .map((item, index) =>
          ({
            id: index + 1,
            name: faker.commerce.productName(),
            createdAt: new Date(),
            updatedAt: new Date()
          })
        ), {})

    return queryInterface.bulkInsert('CategoryLv3s',
      Array.from({ length: 15 }) // 簡化該層級model數量，詳見admin/create.hbs理的說明
        .map((item, index) =>
          ({
            id: index + 1,
            name: faker.commerce.productName(),
            createdAt: new Date(),
            updatedAt: new Date()
          })
        ), {})
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('CategoryLv1s', null, {})
    queryInterface.bulkDelete('CategoryLv2s', null, {})
    return queryInterface.bulkDelete('CategoryLv3s', null, {})
  }
}
