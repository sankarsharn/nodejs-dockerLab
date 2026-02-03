const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    issueDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    returnDate: {
        type: DataTypes.DATE
    },
    status: {
        type: DataTypes.ENUM('issued', 'returned', 'overdue'),
        defaultValue: 'issued'
    },
    fine: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    finePaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    remarks: {
        type: DataTypes.STRING
    }
});

// Instance methods
Transaction.prototype.checkOverdue = function () {
    if (this.status === 'issued' && new Date() > this.dueDate) {
        this.status = 'overdue';
    }
    return this.status;
};

Transaction.prototype.calculateFine = function (finePerDay = 5) {
    if (this.status === 'returned' && this.returnDate > this.dueDate) {
        const diffTime = Math.abs(this.returnDate - this.dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        this.fine = diffDays * finePerDay;
    }
    return this.fine;
};

module.exports = Transaction;
