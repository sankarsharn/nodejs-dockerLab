import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { FiBook, FiCalendar, FiClock, FiAlertTriangle } from 'react-icons/fi';
import './MyBooks.css';

const MyBooks = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyBooks();
    }, []);

    const fetchMyBooks = async () => {
        try {
            const response = await transactionAPI.getMyTransactions();
            setTransactions(response.data.transactions || []);
        } catch (error) {
            console.error('Failed to fetch books:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const isOverdue = (dueDate, status) => {
        return status !== 'returned' && new Date(dueDate) < new Date();
    };

    const getDaysRemaining = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return diff;
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="loading-spinner large"></div>
                    <p>Loading your books...</p>
                </div>
            </div>
        );
    }

    const currentBooks = transactions.filter(t => t.status !== 'returned');
    const returnedBooks = transactions.filter(t => t.status === 'returned');

    return (
        <div className="page-container">
            <div className="my-books-page">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">My Books</h1>
                        <p className="page-subtitle">Track your borrowed books and due dates</p>
                    </div>
                </div>

                {/* Currently Borrowed */}
                <section className="books-section">
                    <h2 className="section-title">
                        <FiBook /> Currently Borrowed ({currentBooks.length})
                    </h2>

                    {currentBooks.length > 0 ? (
                        <div className="books-grid">
                            {currentBooks.map((transaction) => {
                                const overdue = isOverdue(transaction.dueDate, transaction.status);
                                const daysRemaining = getDaysRemaining(transaction.dueDate);

                                return (
                                    <div key={transaction._id} className={`book-card ${overdue ? 'overdue' : ''}`}>
                                        <div className="book-card-header">
                                            <div className="book-icon-large">
                                                <FiBook />
                                            </div>
                                            {overdue && (
                                                <div className="overdue-badge">
                                                    <FiAlertTriangle /> Overdue
                                                </div>
                                            )}
                                        </div>
                                        <div className="book-card-body">
                                            <h3 className="book-title">{transaction.book?.title}</h3>
                                            <p className="book-author">by {transaction.book?.author}</p>
                                            <p className="book-isbn">ISBN: {transaction.book?.isbn}</p>
                                        </div>
                                        <div className="book-card-footer">
                                            <div className="date-info">
                                                <FiCalendar />
                                                <span>Due: {formatDate(transaction.dueDate)}</span>
                                            </div>
                                            <div className={`days-info ${overdue ? 'overdue' : daysRemaining <= 3 ? 'warning' : ''}`}>
                                                <FiClock />
                                                <span>
                                                    {overdue
                                                        ? `${Math.abs(daysRemaining)} days overdue`
                                                        : `${daysRemaining} days left`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="card empty-state">
                            <FiBook className="empty-icon" />
                            <h3>No books currently borrowed</h3>
                            <p>Visit the library to borrow some books!</p>
                        </div>
                    )}
                </section>

                {/* History */}
                {returnedBooks.length > 0 && (
                    <section className="books-section">
                        <h2 className="section-title">
                            <FiClock /> Borrowing History ({returnedBooks.length})
                        </h2>

                        <div className="card">
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Book</th>
                                            <th>Issue Date</th>
                                            <th>Return Date</th>
                                            <th>Fine</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {returnedBooks.map((transaction) => (
                                            <tr key={transaction._id}>
                                                <td>
                                                    <div className="book-info">
                                                        <div className="book-icon">
                                                            <FiBook />
                                                        </div>
                                                        <div>
                                                            <span className="book-title">{transaction.book?.title}</span>
                                                            <span className="book-author">{transaction.book?.author}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{formatDate(transaction.issueDate)}</td>
                                                <td>{formatDate(transaction.returnDate)}</td>
                                                <td>
                                                    {transaction.fine > 0 ? (
                                                        <span className={`fine-badge ${transaction.finePaid ? 'paid' : 'unpaid'}`}>
                                                            ₹{transaction.fine}
                                                            {transaction.finePaid && ' (Paid)'}
                                                        </span>
                                                    ) : (
                                                        <span className="no-fine">None</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default MyBooks;
