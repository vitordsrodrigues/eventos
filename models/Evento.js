const { DataTypes } = require('sequelize');
const db = require('../db/conn');

const Evento = db.define('Evento', {
    
    imagePath: {
        type: DataTypes.STRING,
        allowNull: false
      },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true, 
        },
    },
    local: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    participantes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true, 
            min: 0,      
        },
    },
    data: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
        },
    },
    datalimite: { 
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
        },
    },
    palestrantes: {
        type: DataTypes.STRING, 
        allowNull: true,
    },
    duracao: {
        type: DataTypes.INTEGER,  
        allowNull: false,
        validate: {
            isInt: true,
            min: 1,  
        },
    },
    curso: {
        type: DataTypes.STRING,  
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    descricao: {
        type: DataTypes.STRING,  
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
}, {
    timestamps: true,
});

module.exports = Evento;
