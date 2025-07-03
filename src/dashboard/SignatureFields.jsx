import { FaBuilding, FaEnvelope, FaSignature, FaUser } from "react-icons/fa";

const SignatureFields = () => {
    const fields = [
        { label: "Signature", icon: <FaSignature /> },
        { label: "Full Name", icon: <FaUser /> },
        { label: "Company Name", icon: <FaBuilding /> },
        { label: "Email ID", icon: <FaEnvelope /> }
    ];

    const handleDragStart = (e, field) => {
        e.dataTransfer.setData("text/plain", field.label); // send label only
    };

    return (
        <div style={{ width: 200, padding: '20px', borderRight: '1px solid #ddd' }}>
            <h2>Signature Fields</h2>
            <hr style={{ border: '1px solid black' }} />

            {fields.map((field, index) => (
                <div key={index} style={{ backgroundColor: 'gainsboro', marginBottom: '20px' }}>
                    <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, field)}
                        style={{
                            marginBottom: '20px',
                            fontWeight: 'bold',
                            cursor: 'grab',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            borderRadius: '4px',
                        }}
                    >

                        <h4 style={{ display: 'flex', alignItems: 'start', gap: '5px' }}>
                            <span>{field.label}</span>
                            <span>{field.icon}</span>
                        </h4>

                    </div>
                    <hr style={{ border: '1px solid black' }} />
                </div>
            ))}
        </div>
    );
};

export default SignatureFields;
