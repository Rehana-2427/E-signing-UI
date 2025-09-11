import { useEffect } from 'react';

const RedirectHome = () => {
  useEffect(() => {
    const hostname = window.location.hostname;

    if (hostname === 'localhost') {
      window.location.href = "http://localhost:3035";
    } else if (hostname === 'app.signbook.co') {
      window.location.href = "https://signbook.co";
    }
  }, []);

  return null;
};

export default RedirectHome;
