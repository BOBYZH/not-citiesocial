'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    date_of_birth: DataTypes.DATE,
    gender: DataTypes.BOOLEAN,
    default_phone: DataTypes.STRING,
    default_address: DataTypes.STRING,
    subscription: DataTypes.BOOLEAN,
    is_admin: DataTypes.BOOLEAN
  }, {})
  User.associate = function (models) {
    // associations can be defined here
  }
  return User
}
