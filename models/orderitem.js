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
    subtotal: DataTypes.INTEGER,
    shippingStatus: DataTypes.STRING
  }, {})
  OrderItem.associate = function (models) {
    OrderItem.belongsTo(models.Order)
    OrderItem.belongsTo(models.Product)
  }
  return OrderItem
}
