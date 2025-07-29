import { useEffect, useState } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './Footer';
import './style.css'; // You can add more styles here if needed

const Home = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <>
            <Navbar />
            {/* Hero Section */}
            <div className="container-fluid bg-primary text-white text-center py-5">
                <h1 className="display-4 fw-bold text-white">Welcome to E-Signing</h1>
                <p className="lead">Digitally sign documents securely and efficiently</p>
                <div className="mt-4">
                    {user ? (
                        <a href="/dashboard" className="btn btn-primary btn-lg me-2">Go to Dashboard</a>
                    ) : (
                        <a href="/register" className="btn btn-primary btn-lg me-2">Get Started</a>
                    )}
                    <a href="/about" className="btn btn-light btn-lg me-2">Learn More</a>
                </div>
            </div>

            {/* Features Section */}
            <div className="container py-5">
                <h2 className="text-center mb-4">Why Choose E-Signing?</h2>
                <div className="row text-center">
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="card-title">Secure</h5>
                                <p className="card-text">Bank-level encryption ensures your documents are always safe and private.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="card-title">Fast</h5>
                                <p className="card-text">Sign and share documents in just a few clicks, from any device, anytime.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="card-title">Legally Binding</h5>
                                <p className="card-text">All signatures are compliant with global e-signature regulations.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action Section */}
            <div className="bg-primary text-white py-5 text-center">
                <h3 className="mb-3 text-white">Ready to streamline your document signing?</h3>
                <a href="/register" className="btn btn-light btn-lg me-2">Start for Free</a>
                <a href="/signin" className="btn btn-outline-light btn-lg">Sign In</a>
            </div>

            <Footer />
        </>
    );
};

export default Home;
