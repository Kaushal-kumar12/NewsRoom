// superadmineditorialpoliciespage.jsx

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Save,
  ShieldCheck,
} from "lucide-react";

import {
  getEditorialPolicy,
  saveEditorialPolicy,
} from "../../services/editorial/editorialPolicyService";

const DEFAULT_POLICY = {
  requireReviewForSensitive: true,
  requireReviewForControversial: true,
  allowAuthorPublish: false,
  allowEditorPublish: true,
  allowAdminPublish: true,
  requireAdminForSensitive: true,
  requireSuperAdminForEscalation: true,
  allowScheduledPublishing: true,
  allowYoutubeVideo: true,
  allowUploadedVideo: true,
};

export default function SuperAdminEditorialPoliciesPage() {
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getEditorialPolicy();

        if (result) {
          setPolicy({
            ...DEFAULT_POLICY,
            ...result,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const update = (key, value) => {
    setPolicy((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      setMessage("");

      await saveEditorialPolicy(policy);

      setMessage(
        "Editorial policy updated successfully."
      );
    } catch (error) {
      alert(error?.message || "Unable to save policy.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="editorial-page">
        <div className="editorial-loading">
          Loading editorial policies...
        </div>
      </div>
    );
  }

  return (
    <div className="editorial-page">

      <header className="editorial-hero">

        <div>
          <span className="editorial-kicker">
            GOVERNANCE
          </span>

          <h1>Editorial Policies</h1>

          <p>
            Define how NewsRoom content moves from creation
            to review and publication.
          </p>
        </div>

        <button
          className="editorial-btn editorial-btn-primary"
          onClick={save}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Policies"}
        </button>

      </header>

      {message && (
        <div className="editorial-alert editorial-alert-success">
          <Check size={17} />
          {message}
        </div>
      )}

      <div className="editorial-policy-grid">

        <PolicySection
          icon={ShieldCheck}
          title="Approval Rules"
          description="Control when articles must pass editorial approval."
        >

          <PolicyToggle
            label="Require review for sensitive news"
            checked={policy.requireReviewForSensitive}
            onChange={(value) =>
              update(
                "requireReviewForSensitive",
                value
              )
            }
          />

          <PolicyToggle
            label="Require review for controversial news"
            checked={policy.requireReviewForControversial}
            onChange={(value) =>
              update(
                "requireReviewForControversial",
                value
              )
            }
          />

          <PolicyToggle
            label="Sensitive news requires administrator review"
            checked={policy.requireAdminForSensitive}
            onChange={(value) =>
              update(
                "requireAdminForSensitive",
                value
              )
            }
          />

          <PolicyToggle
            label="Escalation requires Super Admin"
            checked={policy.requireSuperAdminForEscalation}
            onChange={(value) =>
              update(
                "requireSuperAdminForEscalation",
                value
              )
            }
          />

        </PolicySection>

        <PolicySection
          icon={AlertTriangle}
          title="Publishing Permissions"
          description="Control which newsroom roles may publish."
        >

          <PolicyToggle
            label="Authors can publish directly"
            checked={policy.allowAuthorPublish}
            onChange={(value) =>
              update(
                "allowAuthorPublish",
                value
              )
            }
          />

          <PolicyToggle
            label="Editors can publish"
            checked={policy.allowEditorPublish}
            onChange={(value) =>
              update(
                "allowEditorPublish",
                value
              )
            }
          />

          <PolicyToggle
            label="Administrators can publish"
            checked={policy.allowAdminPublish}
            onChange={(value) =>
              update(
                "allowAdminPublish",
                value
              )
            }
          />

          <PolicyToggle
            label="Allow scheduled publishing"
            checked={policy.allowScheduledPublishing}
            onChange={(value) =>
              update(
                "allowScheduledPublishing",
                value
              )
            }
          />

        </PolicySection>

        <PolicySection
          icon={ShieldCheck}
          title="Media Policy"
          description="Control supported media sources."
        >

          <PolicyToggle
            label="Allow YouTube videos"
            checked={policy.allowYoutubeVideo}
            onChange={(value) =>
              update(
                "allowYoutubeVideo",
                value
              )
            }
          />

          <PolicyToggle
            label="Allow uploaded videos"
            checked={policy.allowUploadedVideo}
            onChange={(value) =>
              update(
                "allowUploadedVideo",
                value
              )
            }
          />

        </PolicySection>

      </div>

    </div>
  );
}

function PolicySection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="editorial-policy-card">

      <div className="editorial-policy-heading">

        <div className="editorial-policy-icon">
          <Icon size={19} />
        </div>

        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

      </div>

      <div className="editorial-policy-options">
        {children}
      </div>

    </section>
  );
}

function PolicyToggle({
  label,
  checked,
  onChange,
}) {
  return (
    <label className="editorial-toggle">

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
      />

      <span className="editorial-toggle-track">
        <span />
      </span>

      <strong>{label}</strong>

    </label>
  );
}