import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiBook,
    FiUsers,
    FiRefreshCw,
    FiBarChart2,
    FiArrowRight,
    FiShield,
    FiClock,
    FiDollarSign,
    FiSearch
} from 'react-icons/fi';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: FiBook,
            title: 'Book Management',
            description: 'Add, edit, search, and organize your entire book catalog with ease.'
        },
        {
            icon: FiUsers,
            title: 'Member Management',
            description: 'Register members with auto-generated IDs and track their borrowing history.'
        },
        {
            icon: FiRefreshCw,
            title: 'Issue & Return',
            description: 'Streamlined book lending process with due date tracking.'
        },
        {
            icon: FiDollarSign,
            title: 'Fine Calculation',
            description: 'Automatic fine calculation for overdue books at ₹5 per day.'
        },
        {
            icon: FiBarChart2,
            title: 'Dashboard Analytics',
            description: 'Real-time statistics and insights about your library operations.'
        },
        {
            icon: FiSearch,
            title: 'Smart Search',
            description: 'Quickly find books by title, author, ISBN, or category.'
        }
    ];

    const stats = [
        { value: '10K+', label: 'Books Managed' },
        { value: '5K+', label: 'Active Members' },
        { value: '50K+', label: 'Transactions' },
        { value: '99%', label: 'Uptime' }
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Modern <span className="gradient-text">Library Management</span> System
                    </h1>
                    <p className="hero-subtitle">
                        Streamline your library operations with our comprehensive management solution.
                        Track books, manage members, and automate fine calculations.
                    </p>
                    <div className="hero-buttons">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn-primary">
                                Go to Dashboard <FiArrowRight />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn-primary">
                                    Get Started <FiArrowRight />
                                </Link>
                                <Link to="/register" className="btn-secondary">
                                    Create Account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="visual-card">
                        <div className="visual-header">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                        </div>
                        <div className="visual-content">
                            <div className="visual-stat">
                                <FiBook className="visual-icon" />
                                <div>
                                    <span className="visual-value">2,847</span>
                                    <span className="visual-label">Total Books</span>
                                </div>
                            </div>
                            <div className="visual-stat">
                                <FiUsers className="visual-icon" />
                                <div>
                                    <span className="visual-value">1,234</span>
                                    <span className="visual-label">Members</span>
                                </div>
                            </div>
                            <div className="visual-stat">
                                <FiClock className="visual-icon" />
                                <div>
                                    <span className="visual-value">156</span>
                                    <span className="visual-label">Active Issues</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-container">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-item">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Powerful Features</h2>
                    <p className="section-subtitle">Everything you need to manage your library efficiently</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">
                                <feature.icon />
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <FiShield className="cta-icon" />
                    <h2>Ready to Get Started?</h2>
                    <p>Join thousands of libraries using our system to manage their operations.</p>
                    {!isAuthenticated && (
                        <Link to="/register" className="btn-primary large">
                            Create Free Account <FiArrowRight />
                        </Link>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <span className="logo-icon">📚</span>
                        <span className="logo-text">LibraryMS</span>
                    </div>
                    <p className="footer-text">© 2024 LibraryMS. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
