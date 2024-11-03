
const { DataTypes } = require('sequelize');
const db = require('../db/conn');

const Participacao = db.define('Participacao', {
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    EventoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Participacao;
