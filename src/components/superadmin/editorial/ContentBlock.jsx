import React from "react";
import {
  GripVertical,
  Trash2,
  Image as ImageIcon,
  Video,
  Quote,
  Type,
  Minus,
  PlaySquare,
  Link as LinkIcon,
} from "lucide-react";

function update(block, patch, onChange) {
  onChange({
    ...block,
    ...patch,
  });
}

export default function ContentBlock({
  block,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  readOnly = false,
}) {
  if (!block) return null;

  const type = block.type || "paragraph";

  const renderEditor = () => {

    /* =========================
       PARAGRAPH
    ========================== */

    if (type === "paragraph") {
      return (
        <textarea
          className="content-block-textarea"
          value={block.text || ""}
          disabled={readOnly}
          placeholder="Write your paragraph..."
          onChange={(event) =>
            update(
              block,
              { text: event.target.value },
              onChange
            )
          }
        />
      );
    }

    /* =========================
       HEADING
    ========================== */

    if (type === "heading") {
      return (
        <input
          className="content-block-heading-input"
          value={block.text || ""}
          disabled={readOnly}
          placeholder="Section heading..."
          onChange={(event) =>
            update(
              block,
              { text: event.target.value },
              onChange
            )
          }
        />
      );
    }

    /* =========================
       IMAGE
    ========================== */

    if (type === "image") {
      return (
        <div className="content-block-media-editor">

          {block.url ? (
            <img
              className="content-block-image-preview"
              src={block.url}
              alt={block.alt || ""}
            />
          ) : (
            <div className="content-block-media-empty">
              <ImageIcon size={30} />
              <span>No image selected</span>
            </div>
          )}

          {!readOnly && (
            <div className="content-block-media-fields">

              <label>
                Image URL
                <input
                  value={block.url || ""}
                  placeholder="Firebase Storage URL"
                  onChange={(event) =>
                    update(
                      block,
                      { url: event.target.value },
                      onChange
                    )
                  }
                />
              </label>

              <label>
                Alt text
                <input
                  value={block.alt || ""}
                  placeholder="Describe this image"
                  onChange={(event) =>
                    update(
                      block,
                      { alt: event.target.value },
                      onChange
                    )
                  }
                />
              </label>

              <label>
                Caption
                <input
                  value={block.caption || ""}
                  placeholder="Optional image caption"
                  onChange={(event) =>
                    update(
                      block,
                      { caption: event.target.value },
                      onChange
                    )
                  }
                />
              </label>

            </div>
          )}

        </div>
      );
    }

    /* =========================
       SHORT VIDEO
    ========================== */

    if (type === "short-video") {
      return (
        <div className="content-block-video-editor">

          <div className="content-block-video-icon">
            <PlaySquare size={28} />
          </div>

          <div className="content-block-video-fields">

            <label>
              Video source
              <select
                value={block.source || "firebase"}
                disabled={readOnly}
                onChange={(event) =>
                  update(
                    block,
                    { source: event.target.value },
                    onChange
                  )
                }
              >
                <option value="firebase">
                  Firebase Storage
                </option>

                <option value="youtube">
                  YouTube
                </option>
              </select>
            </label>

            <label>
              Video URL
              <input
                value={block.url || ""}
                disabled={readOnly}
                placeholder="Video URL"
                onChange={(event) =>
                  update(
                    block,
                    { url: event.target.value },
                    onChange
                  )
                }
              />
            </label>

            <label>
              Caption
              <input
                value={block.caption || ""}
                disabled={readOnly}
                placeholder="Optional caption"
                onChange={(event) =>
                  update(
                    block,
                    { caption: event.target.value },
                    onChange
                  )
                }
              />
            </label>

          </div>

        </div>
      );
    }

    /* =========================
       LONG VIDEO
    ========================== */

    if (type === "long-video") {
      return (
        <div className="content-block-video-editor">

          <div className="content-block-video-icon">
            <Video size={28} />
          </div>

          <div className="content-block-video-fields">

            <label>
              Video platform
              <select
                value={block.source || "youtube"}
                disabled={readOnly}
                onChange={(event) =>
                  update(
                    block,
                    { source: event.target.value },
                    onChange
                  )
                }
              >
                <option value="youtube">
                  YouTube
                </option>

                <option value="external">
                  External URL
                </option>
              </select>
            </label>

            <label>
              Video URL
              <input
                value={block.url || ""}
                disabled={readOnly}
                placeholder="YouTube or external video URL"
                onChange={(event) =>
                  update(
                    block,
                    { url: event.target.value },
                    onChange
                  )
                }
              />
            </label>

            <label>
              Caption
              <input
                value={block.caption || ""}
                disabled={readOnly}
                placeholder="Optional caption"
                onChange={(event) =>
                  update(
                    block,
                    { caption: event.target.value },
                    onChange
                  )
                }
              />
            </label>

          </div>

        </div>
      );
    }

    /* =========================
       QUOTE
    ========================== */

    if (type === "quote") {
      return (
        <div className="content-block-quote-editor">

          <Quote size={28} />

          <textarea
            value={block.text || ""}
            disabled={readOnly}
            placeholder="Enter quotation..."
            onChange={(event) =>
              update(
                block,
                { text: event.target.value },
                onChange
              )
            }
          />

          <input
            value={block.author || ""}
            disabled={readOnly}
            placeholder="Source / person"
            onChange={(event) =>
              update(
                block,
                { author: event.target.value },
                onChange
              )
            }
          />

        </div>
      );
    }

    /* =========================
       DIVIDER
    ========================== */

    if (type === "divider") {
      return (
        <div className="content-block-divider-preview">
          <Minus size={22} />
        </div>
      );
    }

    /* =========================
       EMBED
    ========================== */

    if (type === "embed") {
      return (
        <div className="content-block-embed-editor">

          <LinkIcon size={25} />

          <input
            value={block.url || ""}
            disabled={readOnly}
            placeholder="Paste embed URL..."
            onChange={(event) =>
              update(
                block,
                { url: event.target.value },
                onChange
              )
            }
          />

        </div>
      );
    }

    return (
      <div className="content-block-unknown">
        Unsupported content block.
      </div>
    );
  };

  return (
    <article
      className={`content-block content-block-${type}`}
      data-block-index={index}
    >

      {/* =========================
          BLOCK TOOLBAR
      ========================== */}

      {!readOnly && (
        <div className="content-block-toolbar">

          <div className="content-block-drag">
            <GripVertical size={17} />
          </div>

          <div className="content-block-type">

            {type === "paragraph" && (
              <>
                <Type size={15} />
                Paragraph
              </>
            )}

            {type === "heading" && (
              <>
                <Type size={15} />
                Heading
              </>
            )}

            {type === "image" && (
              <>
                <ImageIcon size={15} />
                Image
              </>
            )}

            {type === "short-video" && (
              <>
                <Video size={15} />
                Short video
              </>
            )}

            {type === "long-video" && (
              <>
                <Video size={15} />
                Long video
              </>
            )}

            {type === "quote" && (
              <>
                <Quote size={15} />
                Quote
              </>
            )}

            {type === "divider" && (
              <>
                <Minus size={15} />
                Divider
              </>
            )}

            {type === "embed" && (
              <>
                <LinkIcon size={15} />
                Embed
              </>
            )}

          </div>

          <div className="content-block-actions">

            <button
              type="button"
              disabled={index === 0}
              onClick={onMoveUp}
              title="Move up"
            >
              ↑
            </button>

            <button
              type="button"
              onClick={onMoveDown}
              title="Move down"
            >
              ↓
            </button>

            <button
              type="button"
              className="danger"
              onClick={onRemove}
              title="Remove block"
            >
              <Trash2 size={15} />
            </button>

          </div>

        </div>
      )}

      {/* =========================
          BLOCK CONTENT
      ========================== */}

      <div className="content-block-body">
        {renderEditor()}
      </div>

    </article>
  );
}