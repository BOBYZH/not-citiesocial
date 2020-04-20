'use strict'

const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Payments',
      Array.from({ length: 5 }).map((item, index) =>
        ({
          amount: faker.random.number(),
          sn: faker.random.number(),
          paymentMethod: Math.floor(Math.random() * 3) + 1,
          paidAt: new Date(),
          params: null,
          OrderId: Math.floor(Math.random() * 2) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Payments', null, {})
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
}
