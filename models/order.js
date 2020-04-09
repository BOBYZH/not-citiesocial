'use strict'
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    name: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    sn: DataTypes.INTEGER,
    shipping_status: DataTypes.STRING,
    payment_status: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    phone: DataTypes.STRING,
    address: DataTypes.STRING
  }, {})
  Order.associate = function (models) {
    // associations can be defined here
  }
  return Order
}
