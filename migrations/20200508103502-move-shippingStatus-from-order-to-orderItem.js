'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Orders', 'shippingStatus')
    return queryInterface.addColumn('OrderItems', 'shippingStatus', {
      type: Sequelize.INTEGER
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.addColumn('Orders', 'shippingStatus', {
      type: Sequelize.STRING
    })
    return queryInterface.removeColumn('OrderItems', 'shippingStatus')
  }
}
