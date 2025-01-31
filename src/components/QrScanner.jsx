import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import '../index.css';

const QRScanner = () => {
  const videoRef = useRef(null);
  const [scannedLinks, setScannedLinks] = useState([]);
  const [manualUrl, setManualUrl] = useState("");

  useEffect(() => {
    const savedLinks = JSON.parse(localStorage.getItem("scannedLinks")) || [];
    setScannedLinks(savedLinks);
  }, []);


  const saveScannedLink = (link) => {
    if (link && typeof link === "string" && link.trim() !== "" && !scannedLinks.includes(link)) {
      const updatedLinks = [...scannedLinks, link];
      setScannedLinks(updatedLinks);
      localStorage.setItem("scannedLinks", JSON.stringify(updatedLinks));


      if (!navigator.onLine) {
        const outboxLinks = JSON.parse(localStorage.getItem("outboxLinks")) || [];
        outboxLinks.push(link);
        localStorage.setItem("outboxLinks", JSON.stringify(outboxLinks));
      }
    }
  };


  const deleteScannedLink = (index) => {
    const updatedLinks = scannedLinks.filter((_, i) => i !== index);
    setScannedLinks(updatedLinks);
    localStorage.setItem("scannedLinks", JSON.stringify(updatedLinks));
  };


  const addManualUrl = () => {
    if (manualUrl.trim() === "") {
      alert("Please enter a valid URL.");
      return;
    }
    saveScannedLink(manualUrl);
    setManualUrl(""); 
  };


  const startScanning = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser does not support the camera or the page is not served over a secure connection (HTTPS)."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            console.log("QR Code scanned:", result.data);
            saveScannedLink(result.data);
          },
          { returnDetailedScanResult: true }
        );

        await qrScanner.start(); 


        setTimeout(() => {
          qrScanner.stop();
          stream.getTracks().forEach((track) => track.stop()); 
        }, 10000);
      }
    } catch (error) {
      console.error("Error starting the camera:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="qr-scanner-container">
      <h2>Scan and Save for Later</h2>

      <button className="pretty-button" onClick={startScanning}>
        Start Scanning
      </button>

      <video ref={videoRef} className="video-preview" autoPlay playsInline></video>

      <hr />

      <div className="manual-entry">
        <h3>Manual URL Entry</h3>
        <input
          type="text"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          placeholder="Enter a URL"
          style={{ width: "80%", padding: "5px" }}
        />
        <button className="pretty-button" onClick={addManualUrl} style={{ marginLeft: "10px" }}>
          Add URL
        </button>
      </div>

      <hr />

      <h3>Saved QR Codes:</h3>
      {scannedLinks.length === 0 ? (
        <p className="empty-message">No scans yet. Start scanning!</p>
      ) : (
        <ul className="scanned-list">
          {scannedLinks.map((link, index) => (
            <li key={index}>
              <a href={link} target="_blank" rel="noopener noreferrer">
                {link}
              </a>
              <button className="delete-button" onClick={() => deleteScannedLink(index)}>
                X
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QRScanner;
