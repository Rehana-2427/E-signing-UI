import { createDocAuthSystem } from '@nutrient-sdk/document-authoring';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const EditTemplate = () => {
    const containerRef = useRef(null);
    const [searchParams] = useSearchParams();
    const filename = searchParams.get('filename');
    const fileUrl = `${window.location.origin}/templates/${filename}.docx`;

    useEffect(() => {
        if (containerRef.current && fileUrl) {
            const docEditor = createDocAuthSystem({
                documentUrl: fileUrl,
                container: containerRef.current,
                mode: 'edit',
                user: {
                    id: 'user-123',
                    name: 'John Doe',
                },
            });

            return () => {
                docEditor.destroy?.();
            };
        }
    }, [fileUrl]);


    return (
        <div>
            <h2>Editing: {filename}.docx</h2>
            <div ref={containerRef} style={{ height: '90vh', border: '1px solid #ccc' }} />
        </div>
    );
};

export default EditTemplate;
