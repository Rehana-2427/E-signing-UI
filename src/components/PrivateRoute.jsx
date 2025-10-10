// src/components/PrivateRoute.jsx
import { useEffect, useState } from 'react';

const COOKIE_NAME = 'token';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length >= 2) {
    return parts.pop().split(';')[0] || null;
  }
  return null;
}

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = getCookie(COOKIE_NAME);
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    const isLocalhost = window.location.hostname === 'localhost';
    const redirectURL = isLocalhost
      ? 'http://localhost:3035'
      : 'https://signbook.co';
    window.location.href = redirectURL;
    return null;
  }

  return children;
};

export default PrivateRoute;
