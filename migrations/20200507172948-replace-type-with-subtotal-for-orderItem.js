'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('OrderItems', 'type')
    return queryInterface.addColumn('OrderItems', 'subtotal', {
      type: Sequelize.INTEGER
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.addColumn('OrderItems', 'type', {
      type: Sequelize.STRING
    })
    return queryInterface.removeColumn('OrderItems', 'subtotal')
  }
}
