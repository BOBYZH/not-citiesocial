'use strict'

const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Products',
      Array.from({ length: 10 }).map((item, index) =>
        ({
          id: index + 1,
          name: faker.commerce.productName(),
          description: faker.commerce.product() + '/' + faker.commerce.productName(),
          price: faker.commerce.price(),
          image: 'https://picsum.photos/640/480', // lorempixel is too unstable to use, so i use picsum instead
          UserId: Math.floor(Math.random() * 3) + 1,
          forSale: Math.round(Math.random()),
          createdAt: new Date(),
          updatedAt: new Date(),
          CategoryLv1Id: Math.floor(Math.random() * 6) + 1,
          // 簡化該層級model數量，詳見admin/create.hbs理的說明
          CategoryLv2Id: Math.floor(Math.random() * 24) + 1,
          // 簡化該層級model數量，詳見admin/create.hbs理的說明
          CategoryLv3Id: Math.floor(Math.random() * 15) + 1
        })
      ), {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Products', null, {})
  }
}
