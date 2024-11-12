const { DataTypes } = require('sequelize');
const db = require('../db/conn');
const User = require('./User');
const Evento = require('./Evento');

const Participacao = db.define('Participacao', {
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    EventoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Eventos',
            key: 'id'
        }
    },
}, {
    timestamps: true,
});

module.exports = Participacao;
