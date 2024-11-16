const { DataTypes } = require('sequelize');
const db = require('../db/conn');
const User = require('./User');

const Sugestao = db.define('Sugestao', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    assunto: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    mensagem: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    status: {
        type: DataTypes.ENUM('pendente', 'lida', 'respondida'),
        defaultValue: 'pendente'
    }
});

Sugestao.belongsTo(User);
User.hasMany(Sugestao);

module.exports = Sugestao; 