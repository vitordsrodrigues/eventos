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

Evento.belongsTo(User)
User.hasMany(Evento)

module.exports = Evento