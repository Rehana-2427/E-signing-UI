import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { BsWechat } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import collaborationApi from "../../../api/collaborationApi";

const Contributors = ({ collabId, collaborationName  }) => {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  console.log(collabId, collaborationName);
  useEffect(() => {
    if (collabId) {
      collaborationApi
        .getContributorsDetails(collabId)
        .then((response) => {
          console.log("Contributors data:", response.data);

          const contributorsData = response.data.map((item) => ({
            id: item[0], 
            name: item[1], 
            email: item[2],
            role: item[3], 
            createdBy : item[4],
          }));

          setContributors(contributorsData); // Set the state with the new array of objects
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching contributors:", err); // Log any error
          setError("Failed to load contributors.");
          setLoading(false);
        });
    }
  }, [collabId]);

  if (loading) {
    return <div>Loading contributors...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  const handleChatHubClick = () => {
    navigate("/dashboard/chat-app", {
      state: { collabId, collaborationName ,contributors ,chatType: "collaboration",}, 
    });
  };

  return (
    <div>
      <br />
      <div className="d-flex justify-content-between align-items-center">
        <h4>
          <strong>Details of Contributors</strong>
        </h4>
        <Button variant="secondary" onClick={handleChatHubClick}>
          <BsWechat /> Chat Hub
        </Button>
      </div>

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            {/* <th>Chat</th> */}
          </tr>
        </thead>
        <tbody>
          {contributors.map((contributor, index) => (
            <tr key={contributor.id}>
              <td>{index + 1}</td>
              <td>{contributor.name}</td>
              <td>{contributor.email}</td>
              <td>{contributor.role}</td>
              {/* <td>
                <div className="d-flex gap-2">
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-1x1">
                        1x1 Chat with Contributor
                      </Tooltip>
                    }
                  >
                    <Button variant="outline-primary" size="sm">
                      <IoIosChatbubbles />
                    </Button>
                  </OverlayTrigger>

                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-group">Group Chat Options</Tooltip>
                    }
                  >
                    <div className="dropdown">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <HiOutlineUserGroup />
                      </Button>
                      <ul className="dropdown-menu">
                        <li>
                          <Button className="dropdown-item">
                            All Contributors
                          </Button>
                        </li>
                        <li>
                          <Button className="dropdown-item">
                            Contributors + Reviewers
                          </Button>
                        </li>
                      </ul>
                    </div>
                  </OverlayTrigger>
                </div>
              </td> */}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Contributors;
