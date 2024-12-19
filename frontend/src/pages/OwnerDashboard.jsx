import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DocumentTable } from "@/components/document/DocumentTable";
import { FaQrcode } from "react-icons/fa";

const OwnerDashboard = () => {
  const [owner, setOwner] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!token) {
        console.error("No token found");
        navigate("/login");
        return;
      }

      try {
        const ownerResponse = await fetch(
          "http://localhost:5000/api/owner/owner-dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (ownerResponse.status === 401) {
          console.error("Unauthorized access");
          navigate("/login");
          return;
        }

        if (ownerResponse.ok) {
          const ownerData = await ownerResponse.json();
          setOwner(ownerData.owner);
        } else {
          throw new Error("Failed to load owner data");
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setLoading(false);
    };

    fetchOwnerData();
  }, [navigate, token]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (owner && owner._id) {
        try {
          const { data } = await axios.get(
            `http://localhost:5000/api/chat/received-documents/${owner._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setDocuments(data.documents);
        } catch (error) {
          console.error("Error fetching documents:", error);
        }
      }
    };

    if (owner?._id) {
      fetchDocuments();
    }
  }, [owner, token]);

  const handleQRCodeDownload = async (type) => {
    try {
      const endpoint =
        type === "shop-id"
          ? "http://localhost:5000/api/owner/qr-code/shop-id"
          : "http://localhost:5000/api/owner/qr-code/shop-name";

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { qrCode } = response.data;

      // Convert base64 to a downloadable file
      const link = document.createElement("a");
      link.href = qrCode;
      link.download = `qr-code-${type}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  const handlePrint = async (documentId) => {
    if (!token) {
      console.error("No token found");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/chat/decrypt-file/${documentId}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const decryptedBlob = response.data;
      const decryptedUrl = URL.createObjectURL(decryptedBlob);

      const contentType = decryptedBlob.type;
      if (contentType.includes("image")) {
        const image = new Image();
        image.src = decryptedUrl;
        image.onload = () => {
          const printWindow = window.open("", "_blank", "width=800,height=600");
          if (!printWindow) {
            throw new Error("Pop-up blocked. Please allow pop-ups for printing.");
          }

          printWindow.document.write(
            `<img src="${decryptedUrl}" style="width:100%; height:auto;">`
          );
          printWindow.document.close();

          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              setTimeout(() => {
                printWindow.close();
                URL.revokeObjectURL(decryptedUrl);
              }, 10000);
            }, 1000);
          };
        };
      } else if (contentType.includes("pdf")) {
        const printWindow = window.open(decryptedUrl, "_blank", "width=800,height=600");

        if (!printWindow) {
          throw new Error("Pop-up blocked. Please allow pop-ups for viewing and printing.");
        }

        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            setTimeout(() => {
              printWindow.close();
              URL.revokeObjectURL(decryptedUrl);
            }, 10000);
          }, 1000);
        };
      } else {
        throw new Error("Unsupported file type for printing.");
      }
    } catch (error) {
      console.error("Error handling print:", error);
    }
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }
  if (!owner) {
    return <h1>Owner details could not be loaded.</h1>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {owner?.name}!</h1>
      <p className="mb-2">Username: {owner?.username}</p>
      <p className="mb-6">Shop Name: {owner?.shopName}</p>

      <div className="mb-4 flex gap-4">
        <button
          onClick={() => handleQRCodeDownload("shop-id")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <FaQrcode />
          Download QR Code (Shop ID)
        </button>

        <button
          onClick={() => handleQRCodeDownload("shop-name")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
        >
          <FaQrcode />
          Download QR Code (Shop Name)
        </button>
      </div>

      <DocumentTable documents={documents} handlePrint={handlePrint} token={token} />
    </div>
  );
};

export default OwnerDashboard;
