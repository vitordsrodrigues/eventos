const { DataTypes } = require('sequelize');
const db = require('../db/conn');
const User = require('./User');
const Evento = require('./Evento');

const Participacao = db.define('Participacao', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
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
    }
});

module.exports = Participacao;
