import { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { AiOutlinePlus, AiOutlineSend } from "react-icons/ai";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import chatApi from "../../../api/chatApi";
import signerApi from "../../../api/signerapi";

const SignersChat = () => {
  const location = useLocation();
  const { documentId, documentName } =
    location.state || {};
  const user = JSON.parse(localStorage.getItem("user"));
  const [isGroupChat, setIsGroupChat] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [selectedSigner, setSelectedSigner] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedMessages, setEditedMessages] = useState({});
  const [signers, setSigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [senderEmailFromSender, setSenderEmailFromSender] = useState();
  const chatType = "document";
  console.log(documentId, documentName, chatType);

  useEffect(() => {
    if (documentId) {
      signerApi
        .getDetailsOfSignersById(documentId)
        .then((response) => {
          console.log("Signers data:", response.data);
          setSigners(response.data);

          // Extract senderEmail from the first signer
          if (
            response.data &&
            response.data.length > 0 &&
            response.data[0].senderEmail
          ) {
            setSenderEmailFromSender(response.data[0].senderEmail);
          } else {
            console.error("senderEmail not found in signers");
          }

          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to fetch reviewer details.");
          console.error("Error fetching reviewers:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [documentId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      try {
        let response;

        const chatMode = isGroupChat ? "group" : "individual";

        if (isGroupChat) {
          response = await chatApi.getchatByDocumentSigner({
            userEmail: user?.userEmail || selectedSigner?.email,
            documentId,
            chatMode,
            role: "signer",
          });
        } else {
          const recipientEmail =
            selectedSigner?.email || selectedCreator?.email;
          if (!recipientEmail) {
            setMessages([]);
            return;
          }
          response = await chatApi.getIndiviudalChatSigner({
            documentId,
            chatMode,
            userEmail: user?.userEmail,
            reciver: recipientEmail,
            role: "signer",
          });
        }

        const filteredMessages = response.data.filter((msg) => {
          if (isGroupChat) {
            return (
              msg.sender === user.userEmail ||
              msg.recipients.includes(user.userEmail)
            );
          } else {
            return (
              msg.sender === user.userEmail ||
              msg.recipients.includes(user.userEmail)
            );
          }
        });

        const sortedMessages = filteredMessages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        setMessages(sortedMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [user, documentId, isGroupChat, selectedSigner, selectedCreator]);

  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    const chatContainer = messagesEndRef.current?.parentElement;
    if (chatContainer) {
      const isAtBottom =
        chatContainer.scrollHeight - chatContainer.scrollTop ===
        chatContainer.clientHeight;
      setIsAtBottom(isAtBottom);
    }
  };

  useEffect(() => {
    const chatContainer = messagesEndRef.current?.parentElement;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (messagesEndRef.current?.parentElement) {
        messagesEndRef.current?.parentElement.removeEventListener(
          "scroll",
          handleScroll
        );
      }
    };
  }, []);
  const formatEmailToName = (email) => {
    const emailPart = email.split("@")[0]; // Get the part before '@'
    return emailPart.replace(/\d+/g, ""); // Remove digits from the email part
  };
  //   console.log(senderEmailFromSender)

  const formatMessageDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();

    // Zero out time to compare only date
    const todayZero = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const messageZero = new Date(
      messageDate.getFullYear(),
      messageDate.getMonth(),
      messageDate.getDate()
    );

    const diffTime = todayZero - messageZero; // difference in milliseconds
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return messageDate.toLocaleDateString(); // fallback to locale date
  };

  const groupedMessages = () => {
    const grouped = [];
    let currentDateLabel = null;

    messages.forEach((msg) => {
      const messageDateLabel = formatMessageDate(msg.timestamp);

      if (messageDateLabel !== currentDateLabel) {
        currentDateLabel = messageDateLabel;
        grouped.push({ date: currentDateLabel, messages: [] });
      }
      grouped[grouped.length - 1].messages.push(msg);
    });

    return grouped;
  };

  const handleEdit = (msg) => {
    console.log("clicked");
    console.log(msg);
    setEditingMessage(msg);
    setNewMessage(msg.content);
  };

  const handleDelete = async (id) => {
    console.log("message deleted ", id);
    try {
      await chatApi.deleteMsg(id);

      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== id)
      );

      setEditedMessages((prev) => {
        const newEdited = { ...prev };
        delete newEdited[id];
        return newEdited;
      });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };
  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    const senderEmail = user?.userEmail;

    let recipients = [];
    if (isGroupChat) {
      // Include all contributors except sender
      recipients = signers
        .filter((c) => c.email !== senderEmail)
        .map((c) => c.email);

      // Include the creator if not the sender
      if (
        senderEmailFromSender &&
        senderEmailFromSender !== senderEmail &&
        !recipients.includes(senderEmailFromSender)
      ) {
        recipients.push(senderEmailFromSender);
      }
    } else {
      if (selectedSigner) recipients = [selectedSigner.email];
      else if (selectedCreator) recipients = [selectedCreator.email];
      else return;
    }

    if (editingMessage) {
      try {
        await chatApi.updateMsg(editingMessage.id, newMessage.trim());

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === editingMessage.id
              ? {
                  ...msg,
                  content: newMessage.trim(),
                  edited: true,
                  updatedAt: new Date().toISOString(),
                }
              : msg
          )
        );
        setEditedMessages((prev) => ({
          ...prev,
          [editingMessage.id]: true,
        }));
      } catch (error) {
        console.error("Failed to update message:", error);
      }

      setEditingMessage(null); // Reset editing state
    } else {
      const messageData = {
        sender: senderEmail,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : null,
        recipients,
        chatType: chatType || "document",
        chatMode: isGroupChat ? "group" : "individual",
        documentId: documentId,
        documentName: documentName,
        role: "signer",
        signerDetails: !isGroupChat ? selectedSigner || selectedCreator : null,
      };

      setMessages((prev) => [...prev, messageData]);

      try {
        await chatApi.sendMessage(messageData);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }

    setNewMessage("");
    setSelectedFile(null);
  };

  const handleGroupChatToggle = () => {
    if (!isGroupChat) {
      setMessages([]);
    }
    setIsGroupChat((prev) => !prev);
    setSelectedSigner(null);
    setSelectedCreator(null);
  };
  const handleSignerSelect = ({ name, email, role }) => {
    if (selectedSigner?.email === email) {
      setSelectedSigner(null);
    } else {
      setSelectedSigner({ name, email, role });
      setSelectedCreator(null);
    }
  };
  const handleCreatorSelect = (creatorEmail) => {
    if (selectedCreator?.email === creatorEmail) {
      setSelectedCreator(null);
    } else {
      setSelectedCreator({ email: creatorEmail });
      setSelectedSigner(null);
    }
  };
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
          <h5>
            {isGroupChat
              ? `${documentName} - Group Chat`
              : selectedSigner
              ? `${documentName} - ${
                  selectedSigner.email === user?.userEmail
                    ? "You"
                    : selectedSigner.name ||
                      formatEmailToName(selectedSigner.email)
                }`
              : `${documentName}`}
          </h5>
        </div>
        <div
          style={{
            flex: 1,
            padding: "1rem",
            overflowY: "auto",
            backgroundColor: "#f9f9f9",
          }}
        >
          {isGroupChat && groupedMessages().length === 0 ? (
            <div>No messages available for this group chat</div>
          ) : !isGroupChat && !selectedSigner && !selectedCreator ? (
            <div>Please select a person to whom you want to chat.</div>
          ) : (
            groupedMessages().map((group, idx) => (
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
                        msg.sender === user?.userEmail
                          ? "#e1ffc7"
                          : "#95cc85ff",
                      wordWrap: "break-word",
                      padding: "0.5rem",
                      borderRadius: "8px",
                      maxWidth: "40%",
                      marginLeft: msg.sender === user?.userEmail ? "auto" : "0",
                      marginRight:
                        msg.sender !== user?.userEmail ? "auto" : "0",
                      position: "relative", // Important for absolute positioning of time
                    }}
                  >
                    <div>
                      <strong>
                        {msg.sender === user?.userEmail
                          ? "You"
                          : formatEmailToName(msg.sender)}
                      </strong>
                    </div>

                    <div
                      style={{
                        wordWrap: "break-word",
                        paddingBottom: "1.5rem",
                      }}
                    >
                      {msg.content}
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

                    {/* Time & Edited fixed at bottom-right */}
                    <small
                      style={{
                        color: "#999",
                        fontSize: "0.75rem",
                        position: "absolute",
                        bottom: "4px",
                        right: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      {editedMessages[msg.id] && msg.updatedAt
                        ? new Date(msg.updatedAt).toLocaleTimeString()
                        : new Date(msg.timestamp).toLocaleTimeString()}

                      {editedMessages[msg.id] && (
                        <span style={{ fontStyle: "italic" }}>Edited</span>
                      )}

                      {msg.sender === user.userEmail &&
                        (() => {
                          const now = new Date();
                          const messageTime = new Date(msg.timestamp);
                          const diffMinutes = (now - messageTime) / 1000 / 60;

                          if (diffMinutes <= 10) {
                            return (
                              <>
                                <FaEdit
                                  size={12}
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleEdit(msg)}
                                />
                                <FaTrash
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleDelete(msg.id)}
                                />
                              </>
                            );
                          }

                          return (
                            <FaTrash
                              style={{ cursor: "pointer" }}
                              onClick={() => handleDelete(msg.id)}
                            />
                          );
                        })()}
                    </small>
                  </div>
                ))}
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
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
            onChange={(e) => setNewMessage(e.target.value)} // Update newMessage state
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} // Send on Enter
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
        <div style={{ marginTop: "0.5rem" }}>
          <Button onClick={handleGroupChatToggle} variant="info">
            {isGroupChat ? "Switch to Individual Chat" : "Switch to Group Chat"}
          </Button>
        </div>
        <h4 className="mt-4">{isGroupChat ? "Group Members" : "Signers"}</h4>
        {isGroupChat ? (
          <>
            {senderEmailFromSender && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
              >
                <div>
                  Created By:{" "}
                  {senderEmailFromSender === user?.userEmail
                    ? "You"
                    : senderEmailFromSender}
                </div>
                <hr style={{ margin: "0.5rem 0", borderColor: "#ddd" }} />
              </div>
            )}
            {signers.map(({ name, email }, idx) => (
              <div key={idx} style={{ marginBottom: "1rem" }}>
                <div style={{ fontWeight: "bold" }}>
                  {email === user?.userEmail ? "You" : name}
                </div>
                <div>{email}</div>
                <div>Signer</div>
                <hr style={{ margin: "0.5rem 0", borderColor: "#ddd" }} />
              </div>
            ))}
          </>
        ) : (
          <>
            {senderEmailFromSender && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  backgroundColor:
                    selectedCreator?.email === senderEmailFromSender
                      ? "#e1ffc7"
                      : "#f0f0f0",
                }}
                onClick={() => handleCreatorSelect(senderEmailFromSender)}
              >
                <div>
                  Created By:{" "}
                  {senderEmailFromSender === user?.userEmail
                    ? "You"
                    : senderEmailFromSender}
                </div>
                <hr style={{ margin: "0.5rem 0", borderColor: "#ddd" }} />
              </div>
            )}
            {signers.map(({ name, email, role }, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: "1rem",
                  cursor: "pointer",
                  backgroundColor:
                    selectedSigner?.email === email ? "#e1ffc7" : "#f0f0f0",
                  padding: "0.5rem",
                  borderRadius: "8px",
                }}
                onClick={() => handleSignerSelect({ name, email, role })}
              >
                <div style={{ fontWeight: "bold" }}>
                  {email === user?.userEmail ? "You" : name}
                </div>
                <div>{email}</div>
                <div>Signer</div>
                <hr style={{ margin: "0.5rem 0", borderColor: "#ddd" }} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default SignersChat;
