import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import './style.css';

const Home = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);
    return (
        <div className="text-center">
            <h2>Welcome to E-Signing</h2>
            {user ? (
                <>
                    <h4>Welcome {user.userName}</h4>
                    <Button className="m-2" variant="success" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </>
            ) : (
                <>
                    <Button className="m-2" variant="primary" onClick={() => navigate('/register')}>
                        Register
                    </Button>
                    <Button className="m-2" variant="secondary" onClick={() => navigate('/signin')}>
                        Login
                    </Button>
                </>
            )}
        </div>
    )
}

export default Home
