const { Sequelize } = require('sequelize')

// Ajuste o código com as credenciais fornecidas
const sequelize = new Sequelize('sql10748608', 'sql10748608', '7Us75d96Qr', {
    host: 'sql10.freesqldatabase.com',
    dialect: 'mysql',
    port: 3306,  // Certifique-se de que a porta está configurada corretamente
})

try {
    sequelize.authenticate()
    console.log('Conectamos ao banco de dados!')
} catch (error) {
    console.log(`Não foi possível conectar ao banco de dados: ${error}`)
}

module.exports = sequelize
