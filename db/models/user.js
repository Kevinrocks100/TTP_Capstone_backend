const { DataTypes } = require("sequelize");
const db = require("../db");

const User = db.define("User", {
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  display_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profile_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  }, 
  access_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  refresh_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  spotify_id: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

module.exports = User;
