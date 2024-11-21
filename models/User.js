const {DataTypes} = require('sequelize')

const db = require('../db/conn')

const User = db.define('User',{
    name:{
        type: DataTypes.STRING,
        require:true,
    },
    email:{
        type: DataTypes.STRING,
        require:true,
    },
    password:{
        type: DataTypes.STRING,
        require:true,
    },
    matricula:{
        type: DataTypes.STRING,
        require:false,
    },
    imagem: {
        type: DataTypes.STRING,
        allowNull: true
    }
})
module.exports = User