import { useLocation } from "react-router-dom";

const Chat = () => {
  const location = useLocation();
  const { collabId, collaborationName, contributors } = location.state || {}; // Destructure the state

  console.log(collabId, collaborationName, contributors); // Verify the data being passed

  return (
    <div>
      <h4>{collaborationName} Chat</h4>
      <div>
        <strong>Collaboration ID:</strong> {collabId}
      </div>
      <h5>Contributors</h5>
      <ul>
        {contributors &&
          contributors.map((contributor) => (
            <li key={contributor.id}>
              {contributor.name} ({contributor.role})
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Chat;
