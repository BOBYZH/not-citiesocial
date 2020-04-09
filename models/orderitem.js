'use strict'
module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    OrderId: DataTypes.INTEGER,
    ProductId: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    type: DataTypes.STRING
  }, {})
  OrderItem.associate = function (models) {
    // associations can be defined here
  }
  return OrderItem
}
