'use strict'

const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Orders',
      Array.from({ length: 2 }).map((item, index) => ({
        name: faker.commerce.productName(),
        phone: faker.phone.phoneNumber(),
        address: faker.address.streetAddress(),
        amount: faker.random.number(),
        sn: faker.random.number(),
        shippingStatus: Math.floor(Math.random() * 1),
        paymentStatus: Math.floor(Math.random() * 1),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      ), {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Orders', null, {})
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
}
