const { sequelize } = require('../config/db');
const User = require('./User');
const Book = require('./Book');
const Member = require('./Member');
const Transaction = require('./Transaction');

// Define Associations

// Transaction Relationships
Transaction.belongsTo(Book, { foreignKey: 'bookId' });
Book.hasMany(Transaction, { foreignKey: 'bookId' });

Transaction.belongsTo(Member, { foreignKey: 'memberId' });
Member.hasMany(Transaction, { foreignKey: 'memberId' });

Transaction.belongsTo(User, { as: 'issuer', foreignKey: 'issuedBy' });
User.hasMany(Transaction, { foreignKey: 'issuedBy' });

// Member Relationships (Optional, derived from transactions)
// But we might want specific active loans if needed, but hasMany Transaction covers it.

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Connected successfully');

        // Sync all models
        // Using alter: true to update schema without dropping data
        await sequelize.sync({ alter: true });
        console.log('Database synced');
    } catch (error) {
        console.error('Unable to connect to PostgreSQL:', error.message);
        process.exit(1);
    }
};

module.exports = {
    sequelize,
    connectDB,
    User,
    Book,
    Member,
    Transaction
};
