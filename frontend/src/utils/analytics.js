import api from '../api/api';

/**
 * Global analytics tracker
 */
export const track = async (type, data = {}) => {
    try {
        // 1. Local Internal Analytics
        await api.post('/api/analytics/track', {
            type,
            page: window.location.pathname,
            ...data
        });

        // 2. Google Analytics (if loaded)
        if (typeof window.gtag === 'function') {
            window.gtag('event', type, {
                page_path: window.location.pathname,
                ...data,
                // Map specific fields for GA4 standard ecommerce
                ...(type === 'Purchase' && {
                    transaction_id: data.metadata?.orderId,
                    value: data.amount,
                    currency: 'INR'
                })
            });
        }
    } catch (err) {
        // Silently fail to not interrupt UX
        console.warn('Analytics tracking failed:', err.message);
    }
};

/**
 * High-level event helpers
 */
export const Analytics = {
    visit: () => track('Visit'),
    addToCart: (product, quantity) => track('AddToCart', { 
        productId: product.id || product.productId, 
        amount: product.price * quantity,
        metadata: { title: product.title, quantity }
    }),
    checkoutStart: (amount) => track('CheckoutStart', { amount }),
    purchase: (order) => track('Purchase', { 
        amount: order.amount, 
        metadata: { orderId: order.orderId } 
    }),
    cancel: (orderId) => track('Cancel', { metadata: { orderId } }),
    login: (method) => track('Login', { metadata: { method } }),
    signup: (method) => track('Signup', { metadata: { method } })
};
