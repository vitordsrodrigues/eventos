const { DataTypes } = require('sequelize');
const db = require('../db/conn');

const Evento = db.define('Evento', {
    
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
    
    participantesAtuais: {
    type: DataTypes.INTEGER,
    defaultValue: 0, 
    allowNull: false,
    validate: {
        isInt: true,
        min: 0,
    },
},

    imagem: {
        type: DataTypes.STRING,
        allowNull: true
    },

    requerMatricula: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }

}, {
    timestamps: true,
});

module.exports = Evento;
