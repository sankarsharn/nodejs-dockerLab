import { useState, useEffect } from 'react';
import { transactionAPI, bookAPI, memberAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    FiPlus,
    FiSearch,
    FiRotateCcw,
    FiX,
    FiBook,
    FiUser,
    FiCalendar,
    FiDollarSign
} from 'react-icons/fi';
import './Transactions.css';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [statusFilter, setStatusFilter] = useState('');

    const [issueForm, setIssueForm] = useState({
        bookId: '',
        memberId: '',
        dueDate: ''
    });

    useEffect(() => {
        fetchTransactions();
    }, [pagination.currentPage, statusFilter]);

    const fetchTransactions = async () => {
        try {
            const response = await transactionAPI.getAll({
                page: pagination.currentPage,
                limit: 10,
                status: statusFilter || undefined
            });
            setTransactions(response.data.transactions);
            setPagination({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages
            });
        } catch (error) {
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const fetchBooksAndMembers = async () => {
        try {
            const [booksRes, membersRes] = await Promise.all([
                bookAPI.getAll({ limit: 100, available: 'true' }),
                memberAPI.getAll({ limit: 100, active: 'true' })
            ]);
            setBooks(booksRes.data.books);
            setMembers(membersRes.data.members);
        } catch (error) {
            console.error('Failed to fetch data');
        }
    };

    const handleIssueBook = async (e) => {
        e.preventDefault();
        try {
            await transactionAPI.issueBook(issueForm);
            toast.success('Book issued successfully');
            setShowIssueModal(false);
            setIssueForm({ bookId: '', memberId: '', dueDate: '' });
            fetchTransactions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to issue book');
        }
    };

    const handleReturnBook = async (transactionId) => {
        if (window.confirm('Confirm book return?')) {
            try {
                const response = await transactionAPI.returnBook(transactionId);
                toast.success(response.data.message);
                fetchTransactions();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to return book');
            }
        }
    };

    const openIssueModal = async () => {
        await fetchBooksAndMembers();
        // Set default due date to 14 days from now
        const defaultDue = new Date();
        defaultDue.setDate(defaultDue.getDate() + 14);
        setIssueForm(prev => ({
            ...prev,
            dueDate: defaultDue.toISOString().split('T')[0]
        }));
        setShowIssueModal(true);
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

    return (
        <div className="page-container">
            <div className="transactions-page">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Transactions</h1>
                        <p className="page-subtitle">Manage book issues and returns</p>
                    </div>
                    <button className="btn-primary" onClick={openIssueModal}>
                        <FiPlus /> Issue Book
                    </button>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${statusFilter === '' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-tab ${statusFilter === 'issued' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('issued')}
                        >
                            Issued
                        </button>
                        <button
                            className={`filter-tab ${statusFilter === 'returned' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('returned')}
                        >
                            Returned
                        </button>
                        <button
                            className={`filter-tab ${statusFilter === 'overdue' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('overdue')}
                        >
                            Overdue
                        </button>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="card">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner large"></div>
                        </div>
                    ) : transactions.length > 0 ? (
                        <>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Book</th>
                                            <th>Member</th>
                                            <th>Issue Date</th>
                                            <th>Due Date</th>
                                            <th>Return Date</th>
                                            <th>Status</th>
                                            <th>Fine</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((transaction) => (
                                            <tr key={transaction._id}>
                                                <td>
                                                    <div className="book-info">
                                                        <div className="book-icon">
                                                            <FiBook />
                                                        </div>
                                                        <div>
                                                            <span className="book-title">{transaction.book?.title || 'Unknown'}</span>
                                                            <span className="book-author">{transaction.book?.author}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="member-info-small">
                                                        <span className="member-name">{transaction.member?.name || 'Unknown'}</span>
                                                        <span className="membership-id">{transaction.member?.membershipId}</span>
                                                    </div>
                                                </td>
                                                <td>{formatDate(transaction.issueDate)}</td>
                                                <td className={isOverdue(transaction.dueDate, transaction.status) ? 'overdue-text' : ''}>
                                                    {formatDate(transaction.dueDate)}
                                                </td>
                                                <td>{transaction.returnDate ? formatDate(transaction.returnDate) : '-'}</td>
                                                <td>
                                                    <span className={`status-badge ${transaction.status}`}>
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {transaction.fine > 0 ? (
                                                        <span className={`fine-amount ${transaction.finePaid ? 'paid' : 'unpaid'}`}>
                                                            ₹{transaction.fine}
                                                            {transaction.finePaid && ' (Paid)'}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td>
                                                    {transaction.status !== 'returned' && (
                                                        <button
                                                            className="btn-return"
                                                            onClick={() => handleReturnBook(transaction._id)}
                                                        >
                                                            <FiRotateCcw /> Return
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {pagination.totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        disabled={pagination.currentPage === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                    >
                                        Previous
                                    </button>
                                    <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                                    <button
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <FiBook className="empty-icon" />
                            <h3>No transactions found</h3>
                            <p>Issue your first book to get started</p>
                        </div>
                    )}
                </div>

                {/* Issue Book Modal */}
                {showIssueModal && (
                    <div className="modal-overlay" onClick={() => setShowIssueModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Issue Book</h2>
                                <button className="close-btn" onClick={() => setShowIssueModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleIssueBook} className="modal-form">
                                <div className="form-group">
                                    <label><FiBook /> Select Book *</label>
                                    <select
                                        value={issueForm.bookId}
                                        onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
                                        required
                                    >
                                        <option value="">Choose a book...</option>
                                        {books.map((book) => (
                                            <option key={book._id} value={book._id}>
                                                {book.title} by {book.author} ({book.availableCopies} available)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label><FiUser /> Select Member *</label>
                                    <select
                                        value={issueForm.memberId}
                                        onChange={(e) => setIssueForm({ ...issueForm, memberId: e.target.value })}
                                        required
                                    >
                                        <option value="">Choose a member...</option>
                                        {members.map((member) => (
                                            <option key={member._id} value={member._id}>
                                                {member.name} ({member.membershipId}) - {member.booksIssued?.length || 0}/{member.maxBooksAllowed} books
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label><FiCalendar /> Due Date *</label>
                                    <input
                                        type="date"
                                        value={issueForm.dueDate}
                                        onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowIssueModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Issue Book
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
