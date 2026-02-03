const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Member = sequelize.define('Member', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    membershipId: {
        type: DataTypes.STRING,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add a name' }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: 'Email already exists'
        },
        validate: {
            isEmail: { msg: 'Please add a valid email' },
            notEmpty: { msg: 'Please add an email' }
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add a phone number' }
        }
    },
    address: {
        type: DataTypes.STRING
    },
    membershipType: {
        type: DataTypes.ENUM('standard', 'premium'),
        defaultValue: 'standard'
    },
    membershipStartDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    membershipExpiry: {
        type: DataTypes.DATE,
        allowNull: false
    },
    maxBooksAllowed: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    hooks: {
        beforeCreate: async (member) => {
            const count = await Member.count();
            member.membershipId = 'LIB' + String(count + 1001).padStart(6, '0');

            if (member.membershipType === 'premium') {
                member.maxBooksAllowed = 5;
            }
        }
    }
});

module.exports = Member;
