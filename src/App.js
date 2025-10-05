import React, { useState, useEffect } from 'react';
import './App.css'; // <-- Imports the external stylesheet for design

// --- Placeholder for API Service ---
const MOCK_JWT_PREFIX = "mock_jwt_for_";
const TOKEN_KEY = 'canteen_auth_token';

/**
 * Mocks an API call to a Spring Boot login endpoint.
 * Success: Stores a mock token and resolves.
 * Failure: Rejects if email is 'fail@test.com'.
 */
const mockSpringbootLogin = (email) => {
  console.log(`[API MOCK] Attempting login for: ${email}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Logic for the mock failure case (for testing)
      if (email === 'fail@test.com') {
        reject({ message: "Invalid credentials provided by the API mock." });
      } else {
        // Successful login mock
        const mockToken = `${MOCK_JWT_PREFIX}${btoa(email)}`;
        localStorage.setItem(TOKEN_KEY, mockToken);
        resolve(mockToken);
      }
    }, 1000); // Simulate network delay
  });
};

/**
 * Mocks an API call to a Spring Boot registration endpoint.
 */
const mockSpringbootRegister = (email) => {
  console.log(`[API MOCK] Attempting registration for: ${email}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Successful registration mock
      const mockToken = `${MOCK_JWT_PREFIX}${btoa(email)}`;
      localStorage.setItem(TOKEN_KEY, mockToken);
      resolve(mockToken);
    }, 1000); // Simulate network delay
  });
};

/**
 * Clears the stored token.
 */
const mockSpringbootLogout = () => {
  console.log("[API MOCK] Logging out.");
  localStorage.removeItem(TOKEN_KEY);
};

// --- Shared Components ---

const LoadingSpinner = () => (
  <div className="loading-spinner-container">
    <div className="spinner"></div>
    <p>Loading Canteen Express...</p>
  </div>
);

// --- Authentication Form Component ---

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
            placeholder="e.g., staff@wildcats.edu"
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
  );
};

// --- Main Application Dashboard (Placeholder) ---

const Dashboard = ({ userEmail, onLogout }) => {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">
        Welcome, {userEmail}!
      </h2>
      <p className="dashboard-text">
        This is your secure Canteen Express dashboard.
      </p>

      <div className="integration-notes">
        <p className="notes-title">
          Spring Boot Integration Notes:
        </p>
        <ul className="notes-list">
          <li>Future API calls from React will need to include the JWT in the `Authorization: Bearer [TOKEN_HERE]` header.</li>
          <li>Your Spring Boot app must be configured to accept CORS requests from the React development server (`http://localhost:3000`).</li>
        </ul>
      </div>

      <button
        onClick={onLogout}
        className="logout-button"
      >
        Sign Out
      </button>
    </div>
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
