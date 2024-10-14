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
}, {
    timestamps: true, 
});



module.exports = Evento;
