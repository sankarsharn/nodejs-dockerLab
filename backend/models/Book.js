const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add a book title' }
        }
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add an author' }
        }
    },
    isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: 'ISBN already exists'
        },
        validate: {
            notEmpty: { msg: 'Please add ISBN' }
        }
    },
    category: {
        type: DataTypes.ENUM('Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Literature', 'Philosophy', 'Art', 'Other'),
        allowNull: false
    },
    publisher: {
        type: DataTypes.STRING
    },
    publishedYear: {
        type: DataTypes.INTEGER
    },
    description: {
        type: DataTypes.TEXT
    },
    totalCopies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    },
    availableCopies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    location: {
        type: DataTypes.STRING,
        defaultValue: 'General Section'
    },
    coverImage: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    hooks: {
        beforeCreate: (book) => {
            book.availableCopies = book.totalCopies;
        }
    }
});

module.exports = Book;
