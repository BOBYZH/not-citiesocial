'use strict'
module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    OrderId: DataTypes.INTEGER,
    PoductId: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    type: DataTypes.STRING
  }, {})
  OrderItem.associate = function (models) {
    // associations can be defined here
  }
  return OrderItem
}
