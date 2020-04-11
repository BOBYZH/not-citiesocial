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
    isAdmin: DataTypes.BOOLEAN
  }, {})
  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.Order)
  }
  return User
}
