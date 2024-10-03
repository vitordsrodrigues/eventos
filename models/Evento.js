const { DataTypes } = require('sequelize')

const db = require('../db/conn')
const User = require('./User')

const Evento = db.define('Evento',{
    title:{
        type:DataTypes.STRING,
        allowNull:false,
        require:true,
    },
})



module.exports = Evento