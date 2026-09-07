import { useId, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";

import "./ImageUploadField.css";

function ImageUploadField({ label = "Image", onFileSelected }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const inputId = useId();

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setFileName(file.name);
    setStatus("success");
    onFileSelected(file);
  }

  function handleClearImage() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setFileName("");
    setError("");
    setStatus("idle");
    onFileSelected(null);
  }

  return (
    <div className="image-upload-field">
      <label htmlFor={inputId}>
        <ImagePlus size={18} aria-hidden="true" />
        {label}
      </label>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
      />
      {status === "uploading" && (
        <p className="image-upload-status" aria-live="polite">
          <LoaderCircle size={16} aria-hidden="true" />
          Uploading {fileName}...
        </p>
      )}

      {status === "success" && (
        <div className="image-upload-success">
          <p>{fileName}</p>
          <button
            type="button"
            onClick={handleClearImage}
            aria-label="Remove selected image"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {status === "error" && (
        <p className="image-upload-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export default ImageUploadField;
