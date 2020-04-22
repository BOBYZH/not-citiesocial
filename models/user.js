'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    dateOfBirth: DataTypes.DATE,
    gender: DataTypes.BOOLEAN,
    defaultPhone: DataTypes.STRING,
    defaultAddress: DataTypes.STRING,
    subscription: DataTypes.BOOLEAN,
    isAdmin: DataTypes.BOOLEAN,
    shopName: DataTypes.STRING
  }, {})
  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.Order)
    User.hasMany(models.Product)
  }
  return User
}
