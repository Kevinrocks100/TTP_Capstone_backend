const { DataTypes } = require("sequelize");
const db = require("../db");

const Song = db.define("Song", {
  song_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  artist: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  external_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  preview_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isCurrentlyPlaying: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Song;
