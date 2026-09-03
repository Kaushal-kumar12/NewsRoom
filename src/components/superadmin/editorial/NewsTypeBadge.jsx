import React from "react";
import {
  FileText,
  Image,
  Layers3,
  PlaySquare,
} from "lucide-react";

const TYPES = {
  ARTICLE: {
    label: "Written",
    icon: FileText,
  },

  IMAGE: {
    label: "Poster",
    icon: Image,
  },

  ARTICLE_IMAGE: {
    label: "Written + Poster",
    icon: Layers3,
  },

  VIDEO: {
    label: "Video",
    icon: PlaySquare,
  },

  ARTICLE_VIDEO: {
    label: "Written + Video",
    icon: Layers3,
  },

  ARTICLE_IMAGE_VIDEO: {
    label: "Written + Poster + Video",
    icon: Layers3,
  },
};

export default function NewsTypeBadge({ type = "ARTICLE" }) {
  const config =
    TYPES[type] || {
      label: String(type).replaceAll("_", " "),
      icon: FileText,
    };

  const Icon = config.icon;

  return (
    <span className="editorial-type-badge">
      <Icon size={13} />
      <span>{config.label}</span>
    </span>
  );
}