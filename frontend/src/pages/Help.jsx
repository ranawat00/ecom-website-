import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, HelpCircle, Package, Truck, CreditCard, User, MessageSquare, Phone, Mail, Info } from 'lucide-react';
import '../assets/styles/Help.css';

const Help = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    const helpArticles = [
        { id: 1, category: 'orders', title: 'How to track my order?', content: 'To track your order, visit the "Order History" section in your profile dashboard. Once your artisanal harvest is shipped, a real-time tracking link will be sent to your mobile number and email. You can use this link to track your order until it reach your doorstep.' },
        { id: 2, category: 'shipping', title: 'Shipping information and timelines', content: 'We offer domestic shipping across India. Standard delivery takes 3-5 business days. For remote locations, it may take up to 7 days. You will receive a notification as soon as your package is out for delivery.' },
        { id: 3, category: 'payments', title: 'Payment methods and security', content: 'We accept all major credit cards, debit cards, UPI (GPay, PhonePe), and Net Banking. All transactions are secured with 256-bit encryption via our trusted partner Razorpay.' },
        { id: 4, category: 'account', title: 'How to reset my password or update account details?', content: 'If you forgot your password, click the "Forgot Password" link on the login modal. To update your profile, click the user icon > Profile Details. You can change your name, phone number, and password there.' },
        { id: 5, category: 'shipping', title: 'International shipping availability', content: 'Currently, we only deliver within India. We are working hard to bring our heritage products to international markets very soon. Stay tuned for updates!' },
        { id: 6, category: 'orders', title: 'How to cancel my order?', content: 'You can cancel your order within 2 hours of placement directly from the "Order History" section. Once the order enters the packaging phase, cancellation is not possible. If you missed the window, please contact our support team immediately.' },
        { id: 7, category: 'payments', title: 'Refund policy and timeline', content: 'Once a refund is initiated, it typically takes 5-7 business days to reflect in your original payment method. For UPI payments, refunds are often faster.' },
        { id: 8, category: 'account', title: 'How to change delivery address?', content: 'You can update your shipping address in the "Saved Addresses" section of your profile. Note: Addresses for orders already "In Process" or "Shipped" cannot be changed.' },
        { id: 9, category: 'orders', title: 'Bulk orders and corporate gifting', content: 'For bulk inquiries or custom gifting solutions, please connect with us via the contact form or email support@amritan.com.' },
        { id: 10, category: 'account', title: 'How to connect with the support team?', content: 'You can connect with our support team via Live Chat, Email (support@amritan.com), or Phone (+91 078200 50723). Our team is available Mon-Sat, 9 AM to 7 PM to help you with any issues.' }
    ];

    const getArticlesToDisplay = () => {
        if (searchQuery) {
            const keywords = searchQuery.toLowerCase().split(' ').filter(k => k.trim());
            return helpArticles.filter(article => {
                const searchableText = (article.title + ' ' + article.content).toLowerCase();
                return keywords.every(kw => searchableText.includes(kw));
            });
        }
        if (selectedCategory !== 'all') {
            return helpArticles.filter(article => article.category === selectedCategory);
        }
        return helpArticles;
    };

    const displayArticles = getArticlesToDisplay();

    useEffect(() => {
        if (searchQuery && displayArticles.length === 1) {
            setExpandedId(displayArticles[0].id);
        } else if (!searchQuery) {
            setExpandedId(null);
        }
    }, [searchQuery, displayArticles.length]);

    const categories = [
        { id: 'orders', title: 'Orders', icon: <Package />, count: helpArticles.filter(a => a.category === 'orders').length },
        { id: 'shipping', title: 'Shipping', icon: <Truck />, count: helpArticles.filter(a => a.category === 'shipping').length },
        { id: 'payments', title: 'Payments', icon: <CreditCard />, count: helpArticles.filter(a => a.category === 'payments').length },
        { id: 'account', title: 'Account', icon: <User />, count: helpArticles.filter(a => a.category === 'account').length },
    ];

    const toggleArticle = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="help-page">
            <section className="help-hero">
                <div className="help-container">
                    <h1>How can we help you today?</h1>
                    <div className="help-search-main">
                        <Search className="search-icon" size={24} />
                        <input 
                            type="text" 
                            placeholder="Describe your issue (e.g. 'tracking my order')" 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value) setSelectedCategory('all');
                            }}
                        />
                    </div>
                </div>
            </section>

            <div className="help-container content-section">
                {!searchQuery && (
                    <div className="help-categories-grid">
                        <div 
                            className={`category-card ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
                        >
                            <div className="cat-icon"><HelpCircle /></div>
                            <h3>All Topics</h3>
                            <p>{helpArticles.length} articles</p>
                        </div>
                        {categories.map(cat => (
                            <div 
                                key={cat.id} 
                                className={`category-card ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                <div className="cat-icon">{cat.icon}</div>
                                <h3>{cat.title}</h3>
                                <p>{cat.count} articles</p>
                                <ChevronRight className="arrow" size={16} />
                            </div>
                        ))}
                    </div>
                )}

                <div className="help-main-display">
                    <h2>
                        {searchQuery ? `${displayArticles.length} Search Results` : 
                         (selectedCategory === 'all' ? 'All Help Articles' : `${selectedCategory.toUpperCase()} Articles`)}
                    </h2>
                    
                    <div className="articles-accordion">
                        {displayArticles.map(article => (
                            <div 
                                key={article.id} 
                                className={`article-item ${expandedId === article.id ? 'expanded' : ''}`}
                                onClick={() => toggleArticle(article.id)}
                            >
                                <div className="article-header">
                                    <h3>{article.title}</h3>
                                    <ChevronRight className="toggle-icon" size={20} />
                                </div>
                                {expandedId === article.id && (
                                    <div className="article-content fade-in">
                                        <p>{article.content}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                        {displayArticles.length === 0 && (
                            <div className="empty-results">
                                <Info size={48} />
                                <p>We couldn't find any articles matching your search.</p>
                                <button onClick={() => setSearchQuery('')} className="btn-clear">Clear Search</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="contact-support-block">
                    <div className="contact-info">
                        <h2>Still need assistance?</h2>
                        <p>Our heritage support team is available Mon-Sat, 9am - 7pm.</p>
                    </div>
                    <div className="contact-methods">
                        <div className="method">
                            <MessageSquare className="m-icon" />
                            <div>
                                <strong>Chat with us</strong>
                                <span>Typical response: 5 mins</span>
                            </div>
                        </div>
                        <div className="method">
                            <Mail className="m-icon" />
                            <div>
                                <strong>Email Support</strong>
                                <span>support@amritan.com</span>
                            </div>
                        </div>
                        <div className="method">
                            <Phone className="m-icon" />
                            <div>
                                <strong>Call Us</strong>
                                <span>+91 078200 50723</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Help);
