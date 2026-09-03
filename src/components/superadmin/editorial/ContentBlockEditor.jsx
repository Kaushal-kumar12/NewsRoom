import React from "react";
import {
  GripVertical,
  Image,
  Link2,
  Minus,
  MoveDown,
  MoveUp,
  Quote,
  Trash2,
  Type,
  Video,
  Youtube,
} from "lucide-react";

const TYPES = [
  ["paragraph", "Paragraph", Type],
  ["heading", "Heading", Type],
  ["image", "Image", Image],
  ["youtube", "YouTube video", Youtube],
  ["video", "Short video", Video],
  ["quote", "Quote", Quote],
  ["link", "Link", Link2],
  ["divider", "Divider", Minus],
];

export function makeBlock(type = "paragraph") {
  return {
    id: `block-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,

    type,

    content: "",

    url: "",

    caption: "",

    alt: "",

    mediaUrl: "",

    mediaId: "",

    position: 0,
  };
}

export default function ContentBlockEditor({
  blocks = [],
  onChange,
}) {
  const update = (id, patch) => {
    const next = blocks.map((block) =>
      block.id === id
        ? {
            ...block,
            ...patch,
          }
        : block
    );

    onChange?.(next);
  };

  const remove = (id) => {
    onChange?.(
      blocks.filter((block) => block.id !== id)
    );
  };

  const move = (index, direction) => {
    const target = index + direction;

    if (
      target < 0 ||
      target >= blocks.length
    ) {
      return;
    }

    const next = [...blocks];

    [
      next[index],
      next[target],
    ] = [
      next[target],
      next[index],
    ];

    onChange?.(next);
  };

  const addBlock = (type) => {
    const block = makeBlock(type);

    onChange?.([
      ...blocks,
      block,
    ]);
  };

  return (
    <div className="content-block-editor">
      {blocks.map((block, index) => {
        const typeConfig = TYPES.find(
          ([type]) => type === block.type
        );

        const Icon =
          typeConfig?.[2] || Type;

        const label =
          typeConfig?.[1] ||
          block.type;

        return (
          <div
            className="content-block-card"
            key={block.id}
          >
            <div className="content-block-toolbar">
              <div className="content-block-type">
                <GripVertical size={16} />

                <Icon size={15} />

                <strong>{label}</strong>

                <span>
                  Block {index + 1}
                </span>
              </div>

              <div className="content-block-actions">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() =>
                    move(index, -1)
                  }
                  title="Move up"
                >
                  <MoveUp size={15} />
                </button>

                <button
                  type="button"
                  disabled={
                    index ===
                    blocks.length - 1
                  }
                  onClick={() =>
                    move(index, 1)
                  }
                  title="Move down"
                >
                  <MoveDown size={15} />
                </button>

                <button
                  type="button"
                  className="content-block-delete"
                  onClick={() =>
                    remove(block.id)
                  }
                  title="Delete block"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="content-block-body">
              {block.type === "paragraph" && (
                <textarea
                  value={block.content}
                  onChange={(event) =>
                    update(block.id, {
                      content:
                        event.target.value,
                    })
                  }
                  placeholder="Write the paragraph..."
                  rows={5}
                />
              )}

              {block.type === "heading" && (
                <input
                  value={block.content}
                  onChange={(event) =>
                    update(block.id, {
                      content:
                        event.target.value,
                    })
                  }
                  placeholder="Section heading..."
                />
              )}

              {block.type === "quote" && (
                <textarea
                  value={block.content}
                  onChange={(event) =>
                    update(block.id, {
                      content:
                        event.target.value,
                    })
                  }
                  placeholder="Enter the quotation..."
                  rows={4}
                />
              )}

              {block.type === "image" && (
                <div className="block-media-fields">
                  <label>
                    Image URL
                    <input
                      value={
                        block.mediaUrl || ""
                      }
                      onChange={(event) =>
                        update(block.id, {
                          mediaUrl:
                            event.target.value,
                        })
                      }
                      placeholder="Firebase Storage URL"
                    />
                  </label>

                  <label>
                    Alt text
                    <input
                      value={
                        block.alt || ""
                      }
                      onChange={(event) =>
                        update(block.id, {
                          alt:
                            event.target.value,
                        })
                      }
                      placeholder="Describe this image"
                    />
                  </label>

                  <label>
                    Caption / credit
                    <input
                      value={
                        block.caption || ""
                      }
                      onChange={(event) =>
                        update(block.id, {
                          caption:
                            event.target.value,
                        })
                      }
                      placeholder="Image caption or photographer credit"
                    />
                  </label>

                  {block.mediaUrl && (
                    <img
                      className="content-block-media-preview"
                      src={block.mediaUrl}
                      alt={block.alt || ""}
                    />
                  )}
                </div>
              )}

              {block.type === "youtube" && (
                <div className="block-media-fields">
                  <label>
                    YouTube URL
                    <input
                      value={
                        block.url || ""
                      }
                      onChange={(event) =>
                        update(block.id, {
                          url:
                            event.target.value,
                        })
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </label>

                  <label>
                    Caption
                    <input
                      value={
                        block.caption || ""
                      }
                      onChange={(event) =>
                        update(block.id, {
                          caption:
                            event.target.value,
                        })
                      }
                      placeholder="Video caption"
                    />
                  </label>

                  <div className="content-block-info">
                    YouTube videos are embedded using
                    the saved URL. The video itself does
                    not need to be stored in Firestore.
                  </div>
                </div>
              )}

              {block.type === "video" && (
                <div className="block-media-fields">
                  <label>
                    Firebase Storage video URL
                    <input
                      value={
                        block.mediaUrl || ""
                      }
                      onChange={(event) =>
                        update(block.id, {
                          mediaUrl:
                            event.target.value,
                        })
                      }
                      placeholder="Firebase Storage download URL"
                    />
                  </label>

                  <label>
                    Caption
                    <input
                      value={
                        block.caption || ""
                      }
                      onChange={(event) =>
                        update(block.id, {
                          caption:
                            event.target.value,
                        })
                      }
                      placeholder="Video caption"
                    />
                  </label>

                  {block.mediaUrl && (
                    <video
                      className="content-block-video-preview"
                      src={block.mediaUrl}
                      controls
                    />
                  )}
                </div>
              )}

              {block.type === "link" && (
                <div className="block-media-fields">
                  <label>
                    Link text
                    <input
                      value={
                        block.content || ""
                      }
                      onChange={(event) =>
                        update(block.id, {
                          content:
                            event.target.value,
                        })
                      }
                      placeholder="Text shown to readers"
                    />
                  </label>

                  <label>
                    URL
                    <input
                      value={
                        block.url || ""
                      }
                      onChange={(event) =>
                        update(block.id, {
                          url:
                            event.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </label>
                </div>
              )}

              {block.type === "divider" && (
                <div className="block-divider-preview">
                  <span />
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="block-add-area">
        <div className="block-add-heading">
          <strong>
            Build the story block by block
          </strong>

          <span>
            Add text, images and videos exactly where
            they should appear in the published story.
          </span>
        </div>

        <div className="block-type-grid">
          {TYPES.map(
            ([type, label, Icon]) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  addBlock(type)
                }
              >
                <Icon size={16} />

                <span>{label}</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}