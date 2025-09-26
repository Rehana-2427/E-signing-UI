import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { BsPaperclip, BsPersonCircle, BsSendFill } from 'react-icons/bs';
import { useLocation, useNavigate } from 'react-router-dom';

const Chat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedContact } = location.state || {};
    const contactName = selectedContact?.name || 'Unknown';

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleSend = () => {
        if (message.trim() === '') return;
        setMessages(prev => [...prev, {
            sender: 'You',
            text: message,
            time: getCurrentTime()
        }]);
        setMessage('');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMessages(prev => [...prev, {
                sender: 'You',
                text: `📎 ${file.name}`,
                time: getCurrentTime()
            }]);
        }
    };

    const handleBack = () => {
        navigate(-1);
    }
    return (
        <div className="chat-container">
            <div className="chat-header d-flex align-items-center p-3 border-bottom ">

                <h5 className="mb-0">Chat with {contactName} <BsPersonCircle size={32} className="me-2" /></h5>
                <div className="ms-auto">
                    <Button variant="secondary" onClick={handleBack}>Back</Button>
                </div>
            </div>


            <div className="chat-body p-3 flex-grow-1 overflow-auto" style={{ height: '60vh' }}>
                {messages.length === 0 ? (
                    <p className="text-muted">Start the conversation...</p>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className="mb-2 p-2 rounded"
                            style={{
                                backgroundColor: '#e6dcf5',
                                maxWidth: '70%',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            <div>
                                <strong>{msg.sender}:</strong> <span>{msg.text}</span>
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem', textAlign: 'right' }}>
                                {msg.time}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="chat-footer p-3 border-top bg-white">
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button variant="light" onClick={() => document.getElementById('fileInput').click()}>
                        <BsPaperclip />
                        <input
                            type="file"
                            id="fileInput"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                    </Button>
                    <Button variant="primary" onClick={handleSend}>
                        <BsSendFill />
                    </Button>
                </InputGroup>
            </div>
        </div>
    );
};

export default Chat;
