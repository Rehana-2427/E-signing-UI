import { useEffect, useRef, useState } from "react";
import { AiOutlinePlus, AiOutlineSend } from "react-icons/ai";
import { useLocation } from "react-router-dom";
import chatApi from "../../../api/chatApi";
import documentApi from "../../../api/documentapi";

const ChatModal = () => {
  const location = useLocation();
  const { documentId, documentName } = location.state || {};
  const user = JSON.parse(localStorage.getItem("user")); // Add this near the top of ChatModal

  const [participants, setParticipants] = useState({
    sender: [],
    reviewers: [],
    signers: [],
  });
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // Store the selected file
  const fileInputRef = useRef(null); // Reference to the hidden file input
  const messagesEndRef = useRef(null); // Reference to the bottom of the message container

  useEffect(() => {
    const fetchMessages = async () => {
      if (!documentId || !user) return;

      try {
        const response = await chatApi.getMessages({
          documentId,
          userEmail: user?.userEmail, 
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [documentId, user]);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!documentId) return;
      setLoading(true);
      try {
        const response = await documentApi.getParticipants(documentId);
        setParticipants(response.data);
      } catch (error) {
        console.error("Failed to fetch participants:", error);
        setParticipants({ sender: [], reviewers: [], signers: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [documentId]);

  const extractUsername = (email) => {
    return email.split("@")[0];
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    const newMsg = {
      documentId,
      sender: extractUsername(user?.userEmail),
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : null,
      recipients: [
        ...participants.reviewers.map((p) => extractUsername(p.email)),
        ...participants.signers.map((p) => extractUsername(p.email)),
      ],
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      const response = await chatApi.sendMessage(newMsg);
      console.log("Message sent successfully:", response.data);
    } catch (error) {
      console.error("Failed to send message:", error);
    }

    setNewMessage("");
    setSelectedFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageDate = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    const diffTime = today - messageDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const groupedMessages = () => {
    const grouped = [];
    let currentGroup = null;

    messages.forEach((msg) => {
      const messageDateLabel = formatMessageDate(msg.timestamp);

      if (currentGroup !== messageDateLabel) {
        if (currentGroup !== null) {
          grouped.push({ date: currentGroup, messages: [] });
        }

        currentGroup = messageDateLabel;
        grouped.push({ date: currentGroup, messages: [] });
      }

      grouped[grouped.length - 1].messages.push(msg);
    });

    return grouped;
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Trigger scroll when messages change

  if (loading) return <p>Loading participants...</p>;

  return (
    <div
      style={{
        display: "flex",
        height: "80vh",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
          <h5>{documentName}</h5>
        </div>
        <div
          style={{
            flex: 1,
            padding: "1rem",
            overflowY: "auto",
            backgroundColor: "#f9f9f9",
          }}
        >
          {groupedMessages().map((group, idx) => (
            <div key={idx}>
              <div
                style={{
                  textAlign: "center",
                  color: "#888",
                  margin: "1rem 0",
                  fontWeight: "bold",
                }}
              >
                {group.date}
              </div>
              {group.messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "0.5rem",
                    backgroundColor:
                      msg.sender === user?.userEmail ? "#e1ffc7" : "#f0f0f0", // Different colors for sender/receiver
                    wordWrap: "break-word",
                    padding: "0.5rem",
                    borderRadius: "8px",
                    maxWidth: "40%",
                    marginLeft: msg.sender === user?.userEmail ? "auto" : "0", // Align based on sender/receiver
                  }}
                >
                  {/* Displaying only the message content */}
                  {msg.content}
                  <br />
                  {/* Displaying the timestamp below the message */}
                  <small
                    style={{
                      color: "#999",
                      display: "block",
                      marginTop: "0.5rem",
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </small>
                  {/* Check if there is an attached file and display it */}
                  {msg.fileUrl && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <a
                        href={msg.fileUrl}
                        download={msg.fileUrl.split("/").pop()}
                        style={{ color: "#007bff" }}
                      >
                        {msg.fileUrl.split("/").pop()}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            padding: "0.5rem 1rem",
            borderTop: "1px solid #ddd",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div>
            <button
              title="Attach files"
              style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#555",
              }}
              onClick={handleFileButtonClick}
            >
              <AiOutlinePlus />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
          <textarea
            placeholder="Type a message..."
            rows={1}
            style={{ flex: 1, resize: "none", padding: "0.5rem" }}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSendMessage}
            style={{
              backgroundColor: "#007bff",
              border: "none",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            title="Send"
          >
            <AiOutlineSend />
          </button>
        </div>
      </div>
      <div
        style={{
          width: "250px",
          borderRight: "1px solid #ddd",
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        <h4>Participants</h4>
        <div>
          <strong>Sender</strong>
          <ul>
            {participants.sender.length > 0 ? (
              participants.sender.map(({ email, status }) => (
                <li key={email}>{extractUsername(email)}</li> // Display the username part of the sender's email
              ))
            ) : (
              <li>No Sender</li>
            )}
          </ul>
        </div>
        <div>
          <strong>Reviewers</strong>
          <ul>
            {participants.reviewers.length > 0 ? (
              participants.reviewers.map(({ email, status }) => (
                <li key={email}>
                  {extractUsername(email)} (
                  {status.charAt(0).toUpperCase() + status.slice(1)})
                </li>
              ))
            ) : (
              <li>No Reviewers</li>
            )}
          </ul>
        </div>
        <div>
          <strong>Signers</strong>
          <ul>
            {participants.signers.length > 0 ? (
              participants.signers.map(({ email, status }) => (
                <li key={email}>
                  {extractUsername(email)} (
                  {status.charAt(0).toUpperCase() + status.slice(1)})
                </li>
              ))
            ) : (
              <li>No Signers</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
