import React, { useState, useEffect } from 'react';
import './App.css'; 

// --- Constants & Mock Data ---
const MOCK_JWT_PREFIX = "mock_jwt_for_";
const TOKEN_KEY = 'canteen_auth_token';

const MOCK_MEALS = [
  { id: 1, name: "Chicken Sandwich", price: 4.50, color: 'red' },
  { id: 2, name: "Veggie Wrap", price: 5.00, color: 'yellow' },
  { id: 3, name: "Burger Combo", price: 6.75, color: 'red' },
  { id: 4, name: "Pasta Salad", price: 4.00, color: 'yellow' },
  { id: 5, name: "Fruit Cup", price: 2.50, color: 'yellow' },
  { id: 6, name: "Pizza Slice", price: 3.25, color: 'red' },
  { id: 7, name: "Taco Tuesday", price: 5.50, color: 'red' },
  { id: 8, name: "Side of Fries", price: 1.50, color: 'yellow' },
];

const MOCK_CATEGORIES = ['All', 'Entrees', 'Sides', 'Drinks', 'Desserts'];


// --- Placeholder for API Service ---

const mockSpringbootLogin = (email) => {
  console.log(`[API MOCK] Attempting login for: ${email}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'fail@test.com') {
        reject({ message: "Invalid credentials provided by the API mock." });
      } else {
        const mockToken = `${MOCK_JWT_PREFIX}${btoa(email)}`;
        localStorage.setItem(TOKEN_KEY, mockToken);
        resolve(mockToken);
      }
    }, 1000); 
  });
};

const mockSpringbootRegister = (email) => {
  console.log(`[API MOCK] Attempting registration for: ${email}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockToken = `${MOCK_JWT_PREFIX}${btoa(email)}`;
      localStorage.setItem(TOKEN_KEY, mockToken);
      resolve(mockToken);
    }, 1000);
  });
};

const mockSpringbootLogout = () => {
  console.log("[API MOCK] Logging out.");
  localStorage.removeItem(TOKEN_KEY);
};


// --- Shared Components ---

const LoadingSpinner = () => (
  <div className="auth-page">
    <div className="loading-spinner-container">
      <div className="spinner"></div>
      <p>Loading Canteen Express...</p>
    </div>
  </div>
);

// Icon for Sign Out (Placeholder SVG)
const LogoutIcon = ({ onClick }) => (
  <button onClick={onClick} className="logout-icon" title="Sign Out">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  </button>
);

// --- Header Component ---

const HeaderNav = ({ cartItemCount, onLogout, onCartClick }) => (
  <header className="app-header">
    <div className="logo-section">
      <div className="logo-icon">W</div>
      Wildcats Cafeteria
    </div>
    <div className="nav-controls">
      {/* Updated to show cart count and open cart modal */}
      <button className="nav-button" onClick={onCartClick}>
        Cart ({cartItemCount})
      </button>
      <div className="nav-button">My Orders</div>
      <div className="user-icon" title="Profile">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>
      <LogoutIcon onClick={onLogout} />
    </div>
  </header>
);

// --- Meal Card Component ---

const MealCard = ({ meal, onAddToCart }) => (
  <div className="meal-card">
    <div className="meal-placeholder"></div>
    <h4 className="card-title">{meal.name}</h4>
    <p className="card-price">${meal.price.toFixed(2)}</p>
    <button 
      className={`add-to-cart-button ${meal.color}`}
      onClick={() => onAddToCart(meal)}
    >
      ADD TO CART
    </button>
  </div>
);

// --- Meal Card Grid Component ---

const MealCardGrid = ({ onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Dummy filtering logic
  const filteredMeals = activeCategory === 'All' 
    ? MOCK_MEALS 
    : MOCK_MEALS.filter(m => m.id % 2 === 0); // Placeholder for real filtering

  return (
    <>
      <div className="category-buttons">
        {MOCK_CATEGORIES.map(category => (
          <button 
            key={category} 
            className={`category-button ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="meal-card-grid">
        {filteredMeals.map(meal => (
          <MealCard key={meal.id} meal={meal} onAddToCart={onAddToCart} />
        ))}
        {/* Placeholder cards to fill the grid look */}
        {[...Array(12 - filteredMeals.length)].map((_, index) => (
            <div key={`ph-${index}`} className="meal-card" style={{opacity: 0.5}}>
              <div className="meal-placeholder"></div>
            </div>
        ))}
      </div>
    </>
  );
};


// --- Authentication Form Component (Retained) ---

const AuthForm = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const title = isLogin ? 'LOG IN' : 'REGISTER';
  const subTitle = 'Wildcats Cafeteria';
  const buttonText = isLogin ? 'LOGIN' : 'REGISTER';
  const switchText = isLogin ? 'No account yet? Register here' : 'Already have an account? Log in here';

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        await mockSpringbootLogin(email, password);
      } else {
        await mockSpringbootRegister(email, password);
      }
      onAuthSuccess(email);
    } catch (err) {
      console.error("Auth Error:", err);
      // Display the error message from the mock function
      setError(err.message || "Authentication failed. Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <header className="auth-header">
          <h3 className="auth-subtitle">{subTitle}</h3>
          <h1 className="auth-title">{title}</h1>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="e.g., student@wildcats.edu"
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="Must be 8+ characters"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <div className="button-spinner"></div>
            ) : (
              buttonText
            )}
          </button>
        </form>

        <div className="auth-switch">
          <button
            onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setEmail('');
                setPassword('');
            }}
            className="switch-button"
            disabled={loading}
          >
            {switchText}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Cart Modal Component (Simple Placeholder) ---

const CartModal = ({ isOpen, onClose, cartItems }) => {
  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
            <h2>Your Cart</h2>
            <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        {cartItems.length === 0 ? (
          <p className="empty-cart-message">Your cart is empty. Start adding some delicious meals!</p>
        ) : (
          <div className="cart-list">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">Qty: {item.quantity}</span>
                <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="cart-total">
                <strong>TOTAL:</strong> <span>${total.toFixed(2)}</span>
            </div>
            <button className="checkout-button">Proceed to Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main Application Dashboard ---

const Dashboard = ({ userEmail, onLogout }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Extract username (part before @) for greeting
  const username = userEmail ? userEmail.split('@')[0].toUpperCase() : 'User';

  const handleAddToCart = (meal) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === meal.id);

      if (existingItemIndex > -1) {
        // Item exists, increase quantity
        return prevItems.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // New item, add to cart
        return [...prevItems, { ...meal, quantity: 1 }];
      }
    });
  };

  return (
    <>
      <HeaderNav 
        cartItemCount={cartItemCount} 
        onLogout={onLogout} 
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <div className="dashboard-content">
        
        {/* User Greeting Card (Matching Wireframe) */}
        <div className="greeting-card">
          <div className="greeting-text">
            <h2>Hello, {username}</h2>
            <p>Welcome back to the Canteen Express pre-order system.</p>
          </div>
          {/* Aligned element placeholder from wireframe */}
          <div className="greeting-text" style={{textAlign: 'right'}}>
            <p>Today's Date</p>
            <h2 style={{color: 'var(--color-success)'}}>Available Now</h2>
          </div>
        </div>

        {/* The main content area: Meal Categories and Grid */}
        <MealCardGrid onAddToCart={handleAddToCart} />
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
      />
    </>
  );
};


// --- Main App Component ---

const App = () => {
  const [authToken, setAuthToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check for existing token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken && storedToken.startsWith(MOCK_JWT_PREFIX)) {
      try {
        // Extract email from the mock token for display purposes
        const encodedEmail = storedToken.substring(MOCK_JWT_PREFIX.length);
        const email = atob(encodedEmail);
        setAuthToken(storedToken);
        setUserEmail(email);
      } catch (e) {
        localStorage.removeItem(TOKEN_KEY);
        console.error("Invalid mock token cleared.");
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (email) => {
    const token = localStorage.getItem(TOKEN_KEY);
    setAuthToken(token);
    setUserEmail(email);
  };

  const handleLogout = () => {
    mockSpringbootLogout();
    setAuthToken(null);
    setUserEmail(null);
  };

  // 2. Conditional Rendering Logic
  let content;
  if (isLoading) {
    content = <LoadingSpinner />;
  } else if (authToken) {
    content = <Dashboard userEmail={userEmail} onLogout={handleLogout} />;
  } else {
    content = <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  // 3. Render the UI
  return (
    <div className="app-main-container">
      {content}
    </div>
  );
};

export default App;
