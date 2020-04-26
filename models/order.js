'use strict'
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    name: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    sn: DataTypes.INTEGER,
    shippingStatus: DataTypes.STRING,
    paymentStatus: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.STRING
  }, {})
  Order.associate = function (models) {
    // associations can be defined here
    Order.belongsToMany(models.Product, {
      as: 'items',
      through: {
        model: models.OrderItem, unique: false
      },
      foreignKey: 'OrderId'
    })
    Order.belongsTo(models.User)
    Order.hasMany(models.Payment)
  }
  return Order
}
