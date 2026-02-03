import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import {
    FiAlertTriangle,
    FiUser,
    FiBook,
    FiCalendar,
    FiPhone,
    FiMail
} from 'react-icons/fi';
import './Overdue.css';

const Overdue = () => {
    const [overdueBooks, setOverdueBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverdueBooks();
    }, []);

    const fetchOverdueBooks = async () => {
        try {
            const response = await transactionAPI.getOverdue();
            setOverdueBooks(response.data);
        } catch (error) {
            console.error('Failed to fetch overdue books');
        } finally {
            setLoading(false);
        }
    };

    const calculateDaysOverdue = (dueDate) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = Math.abs(today - due);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateFine = (dueDate) => {
        const finePerDay = 5;
        return calculateDaysOverdue(dueDate) * finePerDay;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner large"></div>
                <p>Loading overdue books...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="overdue-page">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Overdue Books</h1>
                        <p className="page-subtitle">Track and manage overdue book returns</p>
                    </div>
                    <div className="overdue-count">
                        <FiAlertTriangle />
                        <span>{overdueBooks.length} overdue</span>
                    </div>
                </div>

                {overdueBooks.length > 0 ? (
                    <div className="overdue-grid">
                        {overdueBooks.map((transaction) => (
                            <div key={transaction._id} className="overdue-card">
                                <div className="overdue-header">
                                    <div className="days-badge">
                                        {calculateDaysOverdue(transaction.dueDate)} days overdue
                                    </div>
                                    <div className="fine-badge">
                                        ₹{calculateFine(transaction.dueDate)} fine
                                    </div>
                                </div>

                                <div className="overdue-book">
                                    <div className="book-icon-large">
                                        <FiBook />
                                    </div>
                                    <div className="book-details">
                                        <h3>{transaction.book?.title}</h3>
                                        <p>by {transaction.book?.author}</p>
                                        <span className="isbn">ISBN: {transaction.book?.isbn}</span>
                                    </div>
                                </div>

                                <div className="overdue-member">
                                    <div className="member-header">
                                        <FiUser />
                                        <span>Borrowed by</span>
                                    </div>
                                    <div className="member-details">
                                        <h4>{transaction.member?.name}</h4>
                                        <p className="member-id">{transaction.member?.membershipId}</p>
                                        <div className="contact-row">
                                            <span><FiMail /> {transaction.member?.email}</span>
                                        </div>
                                        <div className="contact-row">
                                            <span><FiPhone /> {transaction.member?.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="overdue-dates">
                                    <div className="date-item">
                                        <span className="date-label">Issue Date</span>
                                        <span className="date-value">{formatDate(transaction.issueDate)}</span>
                                    </div>
                                    <div className="date-item">
                                        <span className="date-label">Due Date</span>
                                        <span className="date-value overdue">{formatDate(transaction.dueDate)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card empty-state">
                        <div className="empty-icon success">
                            <FiBook />
                        </div>
                        <h3>No Overdue Books</h3>
                        <p>All books have been returned on time!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Overdue;
