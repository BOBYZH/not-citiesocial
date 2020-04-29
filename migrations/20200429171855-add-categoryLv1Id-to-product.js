'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Products', 'CategoryLv1Id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'CategoryLv1s',
        key: 'id'
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Products', 'CategoryLv1Id')
  }
}
