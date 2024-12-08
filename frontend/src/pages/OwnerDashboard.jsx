import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OwnerDashboard = () => {
  const [owner, setOwner] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch the owner data first
  useEffect(() => {
    const fetchOwnerData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found. Redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        const ownerResponse = await fetch(
          "http://localhost:5000/api/owner/owner-dashboard",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (ownerResponse.status === 401) {
          console.error("Unauthorized access. Redirecting to login...");
          navigate("/login");
        } else if (ownerResponse.ok) {
          const ownerData = await ownerResponse.json();
          setOwner(ownerData.owner);
          console.log("Owner Data:", ownerData.owner);
        } else {
          console.error("Unexpected error:", ownerResponse.statusText);
        }
      } catch (error) {
        console.error("Error fetching owner data:", error);
        setError("Failed to load owner data.");
      }

      setLoading(false);
    };

    fetchOwnerData();
  }, [navigate]);

  // Fetch documents only after the owner data is available
  useEffect(() => {
    const fetchDocuments = async () => {
      if (owner && owner._id) {
        const token = localStorage.getItem("token");

        try {
          const documentsResponse = await axios.get(
            `http://localhost:5000/api/chat/received-documents/${owner._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setDocuments(documentsResponse.data.documents);
        } catch (error) {
          console.error("Error fetching documents:", error);
          setError("Failed to load documents.");
        }
      } else {
        setError("Owner ID is missing.");
      }
    };

    if (owner && owner._id) {
      fetchDocuments();
    }
  }, [owner]);

  const handlePrint = async (documentId, fileUrl) => {
    // Log the document ID when the print button is clicked
    console.log(`Print button clicked for document ID: ${documentId}`);
  
    try {
      // Open a new window for printing
      const printWindow = window.open('', '', 'width=800,height=600');
  
      if (!printWindow) {
        throw new Error("Failed to open print window. Please check your pop-up blocker settings.");
      }
  
      // Get the file extension to determine if it's a PDF or an image
      const fileExtension = fileUrl.split('.').pop().toLowerCase();
  
      // Add basic print styles to the print window
      const printStyles = `
        <style>
          body { margin: 0; padding: 0; width: 100%; height: 100%; }
          iframe { width: 100%; height: 100%; border: none; }
          img { width: 100%; height: auto; }
        </style>
      `;
  
      // If it's a PDF, embed it in an iframe for printing
      if (fileExtension === 'pdf') {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Document</title>
              ${printStyles}
            </head>
            <body>
              <iframe src="${fileUrl}" id="pdf-iframe" frameborder="0"></iframe>
            </body>
          </html>
        `);
  
        printWindow.document.close();
  
        // Wait for the iframe to load
        printWindow.onload = () => {
          const iframe = printWindow.document.getElementById('pdf-iframe');
  
          iframe.onload = () => {
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  
              // Remove the download controls
              const downloadControls = iframeDoc.querySelector('#downloads') ||
                                       iframeDoc.querySelector('viewer-download-controls');
  
              if (downloadControls) {
                downloadControls.remove();
                console.log("Download controls removed.");
              } else {
                console.warn("Download controls not found.");
              }
  
              // Trigger the print button in the PDF viewer's toolbar
              const printButton = iframeDoc.querySelector('button[title="Print"]');
              if (printButton) {
                printButton.click(); // Simulate a click on the print button
              } else {
                printWindow.print(); // Fallback to the default print
              }
            } catch (error) {
              console.error("Failed to modify iframe content:", error);
              printWindow.print(); // Fallback to default print if manipulation fails
            }
          };
        };
      } else {
        // For image files, use the old technique (display the image and print)
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const fileUrlForPrint = URL.createObjectURL(blob);
  
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Document</title>
              ${printStyles}
            </head>
            <body>
              <img src="${fileUrlForPrint}" alt="Document" />
            </body>
          </html>
        `);
  
        printWindow.document.close();
  
        // Trigger print dialog after the image has loaded
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close(); // Close the print window after printing
        };
  
        // Cleanup object URL after printing
        setTimeout(() => {
          URL.revokeObjectURL(fileUrlForPrint);
        }, 30000);
      }
  
      // Delete the document after 30 seconds
      setTimeout(async () => {
        try {
          await axios.delete(`http://localhost:5000/api/chat/delete-document/${documentId}`);
          setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc._id !== documentId));
        } catch (error) {
          console.error("Error deleting document:", error);
          setError("Failed to delete document.");
        }
      }, 30000);
    } catch (error) {
      console.error("Error during printing process:", error);
      setError("Printing failed.");
    }
  };
  
  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (!owner) {
    return <h1>Owner details could not be loaded.</h1>;
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome, {owner.name}!</h1>
      <p>Username: {owner.username}</p>
      <p>Shop Name: {owner.shopName}</p>

      <h2>Received Documents</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}

      {documents.length === 0 ? (
        <p>No documents received.</p>
      ) : (
        <table className="document-table">
          <thead>
            <tr>
              <th>Document Preview</th>
              <th>Sender</th>
              <th>Received At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document._id}>
                <td>
                  <iframe
                    src={document.fileUrl}
                    title="Document Preview"
                    style={{
                      width: "200px",
                      height: "150px",
                      border: "1px solid #ddd",
                    }}
                  ></iframe>
                </td>
                <td>{document.senderName}</td>
                <td>{new Date(document.timestamp).toLocaleString()}</td>
                <td>
                  <button onClick={() => handlePrint(document._id, document.fileUrl)}>
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OwnerDashboard;
