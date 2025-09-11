import { GoogleOAuthProvider } from '@react-oauth/google';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import "./styles/app/app.scss";

const root = ReactDOM.createRoot(document.getElementById('root'));
const GOOGLE_CLIENT_ID = `${process.env.REACT_APP_GOOGLE_CLIENT_ID}`;
console.log("Google Client ID:", GOOGLE_CLIENT_ID);

root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>);

reportWebVitals();
