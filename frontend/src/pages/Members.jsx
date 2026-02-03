import { useState, useEffect } from 'react';
import { memberAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiX,
    FiUser,
    FiMail,
    FiPhone,
    FiEye
} from 'react-icons/fi';
import './Members.css';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberHistory, setMemberHistory] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        membershipType: 'standard',
        membershipExpiry: ''
    });

    useEffect(() => {
        fetchMembers();
    }, [search, pagination.currentPage]);

    const fetchMembers = async () => {
        try {
            const response = await memberAPI.getAll({
                page: pagination.currentPage,
                limit: 10,
                search
            });
            setMembers(response.data.members);
            setPagination({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages
            });
        } catch (error) {
            toast.error('Failed to fetch members');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMember) {
                await memberAPI.update(editingMember._id, formData);
                toast.success('Member updated successfully');
            } else {
                await memberAPI.create(formData);
                toast.success('Member added successfully');
            }
            setShowModal(false);
            resetForm();
            fetchMembers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            email: member.email,
            phone: member.phone,
            address: member.address || '',
            membershipType: member.membershipType,
            membershipExpiry: member.membershipExpiry ? new Date(member.membershipExpiry).toISOString().split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleViewDetails = async (member) => {
        setSelectedMember(member);
        try {
            const response = await memberAPI.getHistory(member._id);
            setMemberHistory(response.data);
        } catch (error) {
            console.error('Failed to fetch history');
        }
        setShowDetailsModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            try {
                await memberAPI.delete(id);
                toast.success('Member deleted successfully');
                fetchMembers();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete member');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            membershipType: 'standard',
            membershipExpiry: ''
        });
        setEditingMember(null);
    };

    const openAddModal = () => {
        resetForm();
        // Set default expiry to 1 year from now
        const defaultExpiry = new Date();
        defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
        setFormData(prev => ({
            ...prev,
            membershipExpiry: defaultExpiry.toISOString().split('T')[0]
        }));
        setShowModal(true);
    };

    const isExpired = (date) => {
        return new Date(date) < new Date();
    };

    return (
        <div className="page-container">
            <div className="members-page">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Members</h1>
                        <p className="page-subtitle">Manage library members and memberships</p>
                    </div>
                    <button className="btn-primary" onClick={openAddModal}>
                        <FiPlus /> Add Member
                    </button>
                </div>

                {/* Search */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or membership ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Members Table */}
                <div className="card">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner large"></div>
                        </div>
                    ) : members.length > 0 ? (
                        <>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Member</th>
                                            <th>Membership ID</th>
                                            <th>Contact</th>
                                            <th>Type</th>
                                            <th>Books Issued</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((member) => (
                                            <tr key={member._id}>
                                                <td>
                                                    <div className="member-info">
                                                        <div className="member-avatar">
                                                            <FiUser />
                                                        </div>
                                                        <div>
                                                            <span className="member-name">{member.name}</span>
                                                            <span className="member-email">{member.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="membership-id">{member.membershipId}</span>
                                                </td>
                                                <td>
                                                    <div className="contact-info">
                                                        <span><FiPhone /> {member.phone}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`type-badge ${member.membershipType}`}>
                                                        {member.membershipType}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="books-count">
                                                        {member.booksIssued?.length || 0} / {member.maxBooksAllowed}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${isExpired(member.membershipExpiry) ? 'expired' : 'active'}`}>
                                                        {isExpired(member.membershipExpiry) ? 'Expired' : 'Active'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="btn-icon view" onClick={() => handleViewDetails(member)}>
                                                            <FiEye />
                                                        </button>
                                                        <button className="btn-icon edit" onClick={() => handleEdit(member)}>
                                                            <FiEdit2 />
                                                        </button>
                                                        <button className="btn-icon delete" onClick={() => handleDelete(member._id)}>
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
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
                            <FiUser className="empty-icon" />
                            <h3>No members found</h3>
                            <p>Add your first member to get started</p>
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingMember ? 'Edit Member' : 'Add New Member'}</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone *</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Membership Type</label>
                                        <select
                                            value={formData.membershipType}
                                            onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                                        >
                                            <option value="standard">Standard (3 books)</option>
                                            <option value="premium">Premium (5 books)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Membership Expiry *</label>
                                        <input
                                            type="date"
                                            value={formData.membershipExpiry}
                                            onChange={(e) => setFormData({ ...formData, membershipExpiry: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        {editingMember ? 'Update Member' : 'Add Member'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Member Details Modal */}
                {showDetailsModal && selectedMember && (
                    <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                        <div className="modal details-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Member Details</h2>
                                <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <div className="member-details">
                                <div className="detail-card">
                                    <div className="detail-avatar">
                                        <FiUser />
                                    </div>
                                    <div className="detail-info">
                                        <h3>{selectedMember.name}</h3>
                                        <p className="membership-id-large">{selectedMember.membershipId}</p>
                                    </div>
                                </div>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label"><FiMail /> Email</span>
                                        <span className="detail-value">{selectedMember.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label"><FiPhone /> Phone</span>
                                        <span className="detail-value">{selectedMember.phone}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Membership Type</span>
                                        <span className={`type-badge ${selectedMember.membershipType}`}>
                                            {selectedMember.membershipType}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Status</span>
                                        <span className={`status-badge ${isExpired(selectedMember.membershipExpiry) ? 'expired' : 'active'}`}>
                                            {isExpired(selectedMember.membershipExpiry) ? 'Expired' : 'Active'}
                                        </span>
                                    </div>
                                </div>

                                {/* Issued Books */}
                                {selectedMember.booksIssued?.length > 0 && (
                                    <div className="issued-books-section">
                                        <h4>Currently Issued Books</h4>
                                        <div className="issued-books-list">
                                            {selectedMember.booksIssued.map((book, index) => (
                                                <div key={index} className="issued-book-item">
                                                    <span className="book-title">{book.title}</span>
                                                    <span className="book-author">by {book.author}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Transaction History */}
                                <div className="history-section">
                                    <h4>Transaction History</h4>
                                    {memberHistory.length > 0 ? (
                                        <div className="history-list">
                                            {memberHistory.slice(0, 5).map((transaction, index) => (
                                                <div key={index} className="history-item">
                                                    <span className="history-book">{transaction.book?.title}</span>
                                                    <span className={`history-status ${transaction.status}`}>
                                                        {transaction.status}
                                                    </span>
                                                    <span className="history-date">
                                                        {new Date(transaction.issueDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-history">No transaction history</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Members;
