import { useState, useEffect } from 'react';
import { bookAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiX,
    FiBook,
    FiFilter
} from 'react-icons/fi';
import './Books.css';

const Books = () => {
    const { user } = useAuth();
    const isStaff = user?.role === 'admin' || user?.role === 'librarian';
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        category: 'Fiction',
        publisher: '',
        publishedYear: '',
        description: '',
        totalCopies: 1,
        location: ''
    });

    useEffect(() => {
        fetchBooks();
        fetchCategories();
    }, [search, category, pagination.currentPage]);

    const fetchBooks = async () => {
        try {
            const response = await bookAPI.getAll({
                page: pagination.currentPage,
                limit: 10,
                search,
                category: category || undefined
            });
            setBooks(response.data.books);
            setPagination({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages
            });
        } catch (error) {
            toast.error('Failed to fetch books');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await bookAPI.getCategories();
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBook) {
                await bookAPI.update(editingBook._id, formData);
                toast.success('Book updated successfully');
            } else {
                await bookAPI.create(formData);
                toast.success('Book added successfully');
            }
            setShowModal(false);
            resetForm();
            fetchBooks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            category: book.category,
            publisher: book.publisher || '',
            publishedYear: book.publishedYear || '',
            description: book.description || '',
            totalCopies: book.totalCopies,
            location: book.location || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await bookAPI.delete(id);
                toast.success('Book deleted successfully');
                fetchBooks();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete book');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            isbn: '',
            category: 'Fiction',
            publisher: '',
            publishedYear: '',
            description: '',
            totalCopies: 1,
            location: ''
        });
        setEditingBook(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    return (
        <div className="page-container">
            <div className="books-page">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Books</h1>
                        <p className="page-subtitle">Manage your library book collection</p>
                    </div>
                    {isStaff && (
                        <button className="btn-primary" onClick={openAddModal}>
                            <FiPlus /> Add Book
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search books by title, author, or ISBN..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-select">
                        <FiFilter className="filter-icon" />
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Books Table */}
                <div className="card">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner large"></div>
                        </div>
                    ) : books.length > 0 ? (
                        <>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Book</th>
                                            <th>ISBN</th>
                                            <th>Category</th>
                                            <th>Available</th>
                                            <th>Location</th>
                                            {isStaff && <th>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.map((book) => (
                                            <tr key={book._id}>
                                                <td>
                                                    <div className="book-info">
                                                        <div className="book-icon">
                                                            <FiBook />
                                                        </div>
                                                        <div>
                                                            <span className="book-title">{book.title}</span>
                                                            <span className="book-author">{book.author}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{book.isbn}</td>
                                                <td>
                                                    <span className="category-badge">{book.category}</span>
                                                </td>
                                                <td>
                                                    <span className={`availability ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                                                        {book.availableCopies} / {book.totalCopies}
                                                    </span>
                                                </td>
                                                <td>{book.location || '-'}</td>
                                                {isStaff && (
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="btn-icon edit" onClick={() => handleEdit(book)}>
                                                                <FiEdit2 />
                                                            </button>
                                                            <button className="btn-icon delete" onClick={() => handleDelete(book._id)}>
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
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
                            <h3>No books found</h3>
                            <p>Add your first book to get started</p>
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Title *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Author *</label>
                                        <input
                                            type="text"
                                            value={formData.author}
                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>ISBN *</label>
                                        <input
                                            type="text"
                                            value={formData.isbn}
                                            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Publisher</label>
                                        <input
                                            type="text"
                                            value={formData.publisher}
                                            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Published Year</label>
                                        <input
                                            type="number"
                                            value={formData.publishedYear}
                                            onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Total Copies *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.totalCopies}
                                            onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Shelf A-12"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        {editingBook ? 'Update Book' : 'Add Book'}
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

export default Books;
