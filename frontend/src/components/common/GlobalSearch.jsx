import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Package, HelpCircle, ArrowRight } from 'lucide-react';
import api from '../../api/api';
import '../../assets/styles/GlobalSearch.css';

const GlobalSearch = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    useEffect(() => {
        const handleSearch = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
                if (response.success) {
                    setResults(response.results);
                }
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(handleSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => searchRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const handleResultClick = (link) => {
        navigate(link);
        onClose();
        setQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="global-search-overlay" onClick={onClose}>
            <div className="global-search-container" onClick={e => e.stopPropagation()}>
                <div className="search-header">
                    <Search className="search-icon-active" size={24} />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search for products, help articles..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Escape' && onClose()}
                    />
                    <button className="search-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="search-results-container">
                    {loading && <div className="search-loading">Searching...</div>}
                    
                    {!loading && query.length >= 2 && results.length === 0 && (
                        <div className="search-no-results">
                            No results found for "{query}"
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="results-list">
                            {results.map((item, idx) => (
                                <div 
                                    key={`${item.type}-${idx}`} 
                                    className="result-item"
                                    onClick={() => handleResultClick(item.link)}
                                >
                                    <div className="item-icon">
                                        {item.type === 'product' ? <Package size={20} /> : <HelpCircle size={20} />}
                                    </div>
                                    <div className="item-info">
                                        <div className="item-title">{item.title}</div>
                                        <div className="item-meta">
                                            {item.type === 'product' ? `₹${item.price} • Products` : 'Support'}
                                        </div>
                                    </div>
                                    <ArrowRight className="item-arrow" size={16} />
                                </div>
                            ))}
                        </div>
                    )}

                    {!query && (
                        <div className="search-suggestions">
                            <h4>Suggested Searches</h4>
                            <div className="suggestion-chips">
                                <span onClick={() => setQuery('Jaggery')}>Jaggery</span>
                                <span onClick={() => setQuery('Ghee')}>Ghee</span>
                                <span onClick={() => setQuery('Track order')}>Track order</span>
                                <span onClick={() => setQuery('Shipping')}>Shipping</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
