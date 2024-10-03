const {Sequelize} = require('sequelize')


const sequelize = new Sequelize('eventos2','root','',{

    host:'localhost',
    dialect:'mysql',
})

try {
    sequelize.authenticate()
    console.log('conectamos')
} catch (error) {
    console.log(`não conectamos:${err}`)
}

module.exports = sequelize