import React, { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Upload,
  Video,
  X,
  RefreshCw,
} from "lucide-react";

export default function MediaUploader({
  accept = "image/*",
  label = "Add media",
  description = "Choose a file from this device",
  value = null,
  onChange,
  onRemove,
  disabled = false,
}) {
  const inputRef = useRef(null);

  const [preview, setPreview] = useState(value || null);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  useEffect(() => {
    return () => {
      if (preview?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(preview.previewUrl);
      }
    };
  }, [preview]);

  const choose = (file) => {
    if (!file || disabled) {
      return;
    }

    if (preview?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(preview.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);

    const media = {
      file,
      previewUrl,
      name: file.name,
      type: file.type,
      size: file.size,
    };

    setPreview(media);

    onChange?.(media);
  };

  const remove = () => {
    if (preview?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(preview.previewUrl);
    }

    setPreview(null);
    onRemove?.();
    onChange?.(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isVideo =
    preview?.type?.startsWith("video/") ||
    accept.includes("video");

  return (
    <div className="media-uploader">
      {preview ? (
        <div className="media-preview">
          <div className="media-preview-visual">
            {isVideo ? (
              <video
                src={preview.previewUrl || preview.url}
                controls
              />
            ) : (
              <img
                src={preview.previewUrl || preview.url}
                alt={preview.alt || preview.name || "Selected media"}
              />
            )}
          </div>

          <div className="media-preview-footer">
            <div className="media-preview-info">
              <strong>
                {preview.name || "Selected media"}
              </strong>

              {preview.size && (
                <small>
                  {(preview.size / 1024 / 1024).toFixed(2)} MB
                </small>
              )}
            </div>

            <div className="media-preview-actions">
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                <RefreshCw size={15} />
                Replace
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={remove}
                className="media-remove-button"
              >
                <X size={15} />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="media-dropzone"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <div className="media-dropzone-icon">
            {accept.includes("video") ? (
              <Video size={23} />
            ) : (
              <ImagePlus size={23} />
            )}
          </div>

          <strong>{label}</strong>

          <span>{description}</span>

          <small>
            <Upload size={13} />
            Choose from device
          </small>
        </button>
      )}

      <input
        ref={inputRef}
        hidden
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(event) =>
          choose(event.target.files?.[0])
        }
      />
    </div>
  );
}