// src/pages/admin/StaffProfilePage.jsx

import {

  useEffect,

  useRef,

  useState,

} from "react";


import {

  Camera,

  CheckCircle2,

  Clock,

  Edit3,

  FileText,

  Globe,

  LoaderCircle,

  Lock,

  Mail,

  MapPin,

  Phone,

  Save,

  User,

  X,

} from "lucide-react";


import {

  useAuth,

} from "../../context/AuthContext";


import {

  getRoleLabel,

  normalizeRole,

  ROLES,

} from "../../config/rolePermissions";


import {

  storage,

  ref,

  uploadBytes,

  getDownloadURL,

} from "../../services/firebase";


import {

  canRequestContactChange,

  CONTACT_CHANGE_TYPE,

  createContactChangeRequest,

  getPendingContactChangeRequestsForUser,

} from "../../services/contactChangeRequestService";


export default function StaffProfilePage() {


  /* =========================================================
     AUTH
  ========================================================= */

  const {

    user,

    profile,

    firebaseUser,

    role,

    updateOwnProfile,

  } = useAuth();


  /* =========================================================
     REFS
  ========================================================= */

  const fileInputRef =

    useRef(null);


  /* =========================================================
     PAGE STATE
  ========================================================= */

  const [

    editing,

    setEditing,

  ] =

    useState(false);


  const [

    saving,

    setSaving,

  ] =

    useState(false);


  const [

    uploading,

    setUploading,

  ] =

    useState(false);


  const [

    message,

    setMessage,

  ] =

    useState("");


  const [

    error,

    setError,

  ] =

    useState("");


  /* =========================================================
     CONTACT REQUEST STATE
  ========================================================= */

  const [

    contactModal,

    setContactModal,

  ] =

    useState(null);


  const [

    requesting,

    setRequesting,

  ] =

    useState(false);


  const [

    contactValue,

    setContactValue,

  ] =

    useState("");


  /* =========================================================
     PENDING REQUESTS
  ========================================================= */

  const [

    pendingRequests,

    setPendingRequests,

  ] =

    useState([]);


  const [

    loadingRequests,

    setLoadingRequests,

  ] =

    useState(true);


  /* =========================================================
     ROLE
  ========================================================= */

  const normalizedRole =

    normalizeRole(

      role ||

      profile?.role ||

      user?.role

    );


  const isAuthor =

    normalizedRole ===

    ROLES.AUTHOR;


  const isEditor =

    normalizedRole ===

    ROLES.EDITOR;


  const isAdmin =

    normalizedRole ===

    ROLES.ADMIN;


  const canRequestContactChanges =

    canRequestContactChange(

      normalizedRole

    );


  /* =========================================================
     FORM
  ========================================================= */

  const [

    form,

    setForm,

  ] =

    useState(

      buildForm(

        profile ||

        user ||

        {}

      )

    );


  /* =========================================================
     UPDATE FORM WHEN PROFILE CHANGES
  ========================================================= */

  useEffect(

    () => {


      setForm(

        buildForm(

          profile ||

          user ||

          {}

        )

      );


    },

    [

      profile,

      user,

    ]

  );


  /* =========================================================
     LOAD PENDING CONTACT REQUESTS
  ========================================================= */

  async function loadPendingRequests() {


    if (

      !firebaseUser?.uid

    ) {


      setPendingRequests([]);

      setLoadingRequests(false);

      return;

    }


    try {


      setLoadingRequests(true);


      const requests =

        await getPendingContactChangeRequestsForUser(

          firebaseUser.uid

        );


      setPendingRequests(

        Array.isArray(

          requests

        )

          ? requests

          : []

      );


    } catch (

      requestError

    ) {


      console.error(

        "Unable to load pending contact requests:",

        requestError

      );


      setPendingRequests([]);


    } finally {


      setLoadingRequests(false);

    }

  }


  useEffect(

    () => {


      loadPendingRequests();


    },

    [

      firebaseUser?.uid,

    ]

  );


  /* =========================================================
     DISPLAY INFORMATION
  ========================================================= */

  const displayName =

    profile?.name ||

    profile?.displayName ||

    firebaseUser?.displayName ||

    "Staff User";


  const avatar =

    form.avatar ||

    profile?.avatar ||

    firebaseUser?.photoURL ||

    "";


  const avatarLetter =

    String(

      displayName

    )

      .charAt(0)

      .toUpperCase();


  const currentEmail =

    profile?.email ||

    firebaseUser?.email ||

    "";


  const currentPhone =

    profile?.phoneNumber ||

    profile?.phone ||

    firebaseUser?.phoneNumber ||

    "";


  /* =========================================================
     GET PENDING REQUEST BY TYPE
  ========================================================= */

  const pendingEmailRequest =

    pendingRequests.find(

      (

        request

      ) =>

        request.type ===

        CONTACT_CHANGE_TYPE.EMAIL

    );


  const pendingPhoneRequest =

    pendingRequests.find(

      (

        request

      ) =>

        request.type ===

        CONTACT_CHANGE_TYPE.PHONE

    );


  /* =========================================================
     UPDATE FIELD
  ========================================================= */

  function updateField(

    field,

    value

  ) {


    setForm(

      (

        previous

      ) => ({

        ...previous,

        [field]:

          value,

      })

    );

  }


  /* =========================================================
     CANCEL EDIT
  ========================================================= */

  function cancelEdit() {


    setForm(

      buildForm(

        profile ||

        user ||

        {}

      )

    );


    setEditing(false);


    setError("");


    setMessage("");

  }


  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  async function handleSave(

    event

  ) {


    event.preventDefault();


    try {


      setSaving(true);


      setError("");


      setMessage("");


      /*
       * updateOwnProfile only updates
       * normal profile information.
       *
       * Email and phone are intentionally
       * not included.
       */

      await updateOwnProfile(

        form

      );


      setMessage(

        "Your profile has been updated successfully."

      );


      setEditing(false);


    } catch (

      saveError

    ) {


      console.error(

        saveError

      );


      setError(

        saveError?.message ||

        "Unable to update your profile."

      );


    } finally {


      setSaving(false);

    }

  }


  /* =========================================================
     AVATAR UPLOAD
  ========================================================= */

  async function handleAvatarUpload(

    event

  ) {


    const file =

      event.target.files?.[0];


    if (

      !file

    ) {

      return;

    }


    if (

      !file.type.startsWith(

        "image/"

      )

    ) {


      setError(

        "Please select a valid image file."

      );

      return;

    }


    if (

      file.size >

      5 * 1024 * 1024

    ) {


      setError(

        "Profile image must be smaller than 5 MB."

      );

      return;

    }


    if (

      !firebaseUser?.uid

    ) {


      setError(

        "Unable to identify your account."

      );

      return;

    }


    try {


      setUploading(true);


      setError("");


      setMessage("");


      const safeName =

        file.name.replace(

          /[^a-zA-Z0-9._-]/g,

          "-"

        );


      const storagePath =

        `profile-avatars/${firebaseUser.uid}/${Date.now()}-${safeName}`;


      const storageReference =

        ref(

          storage,

          storagePath

        );


      await uploadBytes(

        storageReference,

        file

      );


      const imageUrl =

        await getDownloadURL(

          storageReference

        );


      updateField(

        "avatar",

        imageUrl

      );


      setMessage(

        "Profile picture uploaded. Click Save Changes to apply it."

      );


    } catch (

      uploadError

    ) {


      console.error(

        "Avatar upload error:",

        uploadError

      );


      setError(

        uploadError?.message ||

        "Unable to upload profile picture."

      );


    } finally {


      setUploading(false);

    }

  }


  /* =========================================================
     OPEN CONTACT REQUEST
  ========================================================= */

  function openContactRequest(

    type

  ) {


    if (

      !canRequestContactChanges

    ) {


      setError(

        "Your account is not allowed to request contact changes."

      );

      return;

    }


    if (

      type ===

      CONTACT_CHANGE_TYPE.EMAIL

      &&

      pendingEmailRequest

    ) {


      setError(

        "You already have a pending email change request."

      );

      return;

    }


    if (

      type ===

      CONTACT_CHANGE_TYPE.PHONE

      &&

      pendingPhoneRequest

    ) {


      setError(

        "You already have a pending phone number change request."

      );

      return;

    }


    setError("");


    setMessage("");


    setContactModal(

      type

    );


    setContactValue("");

  }


  /* =========================================================
     CLOSE CONTACT REQUEST
  ========================================================= */

  function closeContactRequest() {


    if (

      requesting

    ) {

      return;

    }


    setContactModal(

      null

    );


    setContactValue("");

  }


  /* =========================================================
     SUBMIT CONTACT CHANGE REQUEST
  ========================================================= */

  async function submitContactRequest(

    event

  ) {


    event.preventDefault();


    if (

      !firebaseUser?.uid

    ) {


      setError(

        "You are not authenticated."

      );

      return;

    }


    if (

      !contactModal

    ) {


      setError(

        "Invalid contact change request."

      );

      return;

    }


    try {


      setRequesting(true);


      setError("");


      setMessage("");


      /*
       * IMPORTANT:
       *
       * We directly use the new
       * contactChangeRequestService.
       *
       * This prevents the old AuthContext
       * profileChangeRequests collection
       * from being used.
       */

      await createContactChangeRequest({

        user: {

          ...user,

          ...profile,

          uid:

            firebaseUser.uid,


          email:

            currentEmail,


          role:

            normalizedRole,


          name:

            displayName,


          displayName:

            displayName,


          phoneNumber:

            currentPhone,

        },


        type:

          contactModal,


        requestedValue:

          contactValue,

      });


      const requestedType =

        contactModal;


      closeContactRequest();


      await loadPendingRequests();


      setMessage(

        requestedType ===

        CONTACT_CHANGE_TYPE.EMAIL

          ? "Your email change request has been submitted successfully. It is waiting for approval."

          : "Your mobile number change request has been submitted successfully. It is waiting for approval."

      );


    } catch (

      requestError

    ) {


      console.error(

        "Contact change request error:",

        requestError

      );


      setError(

        requestError?.message ||

        "Unable to submit your contact change request."

      );


    } finally {


      setRequesting(false);

    }

  }


  /* =========================================================
     GET APPROVAL MESSAGE
  ========================================================= */

  function getApprovalMessage() {


    if (

      isAuthor ||

      isEditor

    ) {


      return (

        "Email and mobile number changes require approval from an Admin or Super Admin."

      );

    }


    if (

      isAdmin

    ) {


      return (

        "Email and mobile number changes require Super Admin approval."

      );

    }


    return (

      "Contact information changes require authorization."

    );

  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="staff-profile-page">


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="staff-profile-header">


        <div>


          <p className="staff-profile-eyebrow">

            ACCOUNT

          </p>


          <h1>

            My Profile

          </h1>


          <p>

            Manage your personal information and NewsRoom profile.

          </p>


        </div>


        {!editing ? (

          <button

            type="button"

            className="staff-profile-edit-button"

            onClick={() =>

              setEditing(

                true

              )

            }

          >

            <Edit3

              size={17}

            />


            Edit Profile

          </button>

        ) : (

          <button

            type="button"

            className="staff-profile-cancel-button"

            onClick={

              cancelEdit

            }

          >

            <X

              size={17}

            />


            Cancel

          </button>

        )}


      </section>


      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && (

        <div className="staff-profile-message success">


          <CheckCircle2

            size={18}

          />


          <span>

            {message}

          </span>


        </div>

      )}


      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (

        <div className="staff-profile-message error">


          <X

            size={18}

          />


          <span>

            {error}

          </span>


        </div>

      )}


      {/* =====================================================
          PROFILE HERO
      ===================================================== */}

      <section className="staff-profile-hero">


        <div className="staff-profile-avatar-area">


          <div className="staff-profile-avatar-large">


            {avatar ? (

              <img

                src={

                  avatar

                }

                alt={

                  displayName

                }

              />

            ) : (

              <span>

                {avatarLetter}

              </span>

            )}


            {editing && (

              <button

                type="button"

                className="staff-avatar-upload"

                onClick={() =>

                  fileInputRef.current?.click()

                }

                disabled={

                  uploading

                }

                title="Change profile picture"

              >


                {uploading ? (

                  <LoaderCircle

                    size={17}

                    className="staff-spin"

                  />

                ) : (

                  <Camera

                    size={17}

                  />

                )}


              </button>

            )}


          </div>


          <input

            ref={

              fileInputRef

            }

            type="file"

            accept="image/*"

            hidden

            onChange={

              handleAvatarUpload

            }

          />


        </div>


        <div className="staff-profile-hero-info">


          <h2>

            {displayName}

          </h2>


          <span className="staff-profile-role">


            {getRoleLabel(

              normalizedRole

            )}


          </span>


          <p>


            {profile?.bio ||

              "Add a short professional bio to your profile."

            }


          </p>


          <div className="staff-profile-hero-meta">


            <span>


              <Mail

                size={15}

              />


              {currentEmail ||

                "No email"

              }


            </span>


            <span>


              <Phone

                size={15}

              />


              {currentPhone ||

                "No mobile number"

              }


            </span>


          </div>


        </div>


        <div className="staff-profile-account-status">


          <span>

            Account Status

          </span>


          <strong>


            {profile?.accountStatus ||

              profile?.status ||

              "ACTIVE"

            }


          </strong>


        </div>


      </section>


      {/* =====================================================
          MAIN FORM
      ===================================================== */}

      <form

        onSubmit={

          handleSave

        }

      >


        <div className="staff-profile-grid">


          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="staff-profile-main-column">


            {/* =============================================
                BASIC INFORMATION
            ============================================= */}

            <section className="staff-profile-card">


              <div className="staff-profile-card-heading">


                <div>


                  <User

                    size={19}

                  />


                  <div>


                    <h3>

                      Basic Information

                    </h3>


                    <p>

                      Your public staff profile information.

                    </p>


                  </div>


                </div>


              </div>


              <div className="staff-profile-fields two-columns">


                <ProfileField

                  label="Full Name"

                  value={

                    form.name

                  }

                  disabled={

                    !editing

                  }

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "name",

                      value

                    )

                  }

                />


                <ProfileField

                  label="Website"

                  value={

                    form.website

                  }

                  disabled={

                    !editing

                  }

                  placeholder="https://example.com"

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "website",

                      value

                    )

                  }

                />


              </div>


              <div className="staff-profile-fields">


                <ProfileTextarea

                  label="Short Bio"

                  value={

                    form.bio

                  }

                  disabled={

                    !editing

                  }

                  placeholder="Write a short professional bio..."

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "bio",

                      value

                    )

                  }

                />


                <ProfileTextarea

                  label="About Me"

                  value={

                    form.about

                  }

                  disabled={

                    !editing

                  }

                  placeholder="Tell people more about yourself..."

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "about",

                      value

                    )

                  }

                />


              </div>


            </section>


            {/* =============================================
                ADDRESS
            ============================================= */}

            <section className="staff-profile-card">


              <div className="staff-profile-card-heading">


                <div>


                  <MapPin

                    size={19}

                  />


                  <div>


                    <h3>

                      Address

                    </h3>


                    <p>

                      Add your location information.

                    </p>


                  </div>


                </div>


              </div>


              <div className="staff-profile-fields">


                <ProfileField

                  label="Address"

                  value={

                    form.address

                  }

                  disabled={

                    !editing

                  }

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "address",

                      value

                    )

                  }

                />


              </div>


              <div className="staff-profile-fields three-columns">


                <ProfileField

                  label="City"

                  value={

                    form.city

                  }

                  disabled={

                    !editing

                  }

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "city",

                      value

                    )

                  }

                />


                <ProfileField

                  label="State"

                  value={

                    form.state

                  }

                  disabled={

                    !editing

                  }

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "state",

                      value

                    )

                  }

                />


                <ProfileField

                  label="Country"

                  value={

                    form.country

                  }

                  disabled={

                    !editing

                  }

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "country",

                      value

                    )

                  }

                />


              </div>


              <div className="staff-profile-fields">


                <ProfileField

                  label="PIN / Postal Code"

                  value={

                    form.postalCode

                  }

                  disabled={

                    !editing

                  }

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "postalCode",

                      value

                    )

                  }

                />


              </div>


            </section>


            {/* =============================================
                PROFESSIONAL PROFILE
            ============================================= */}

            <section className="staff-profile-card">


              <div className="staff-profile-card-heading">


                <div>


                  <FileText

                    size={19}

                  />


                  <div>


                    <h3>

                      Professional Profile

                    </h3>


                    <p>

                      Additional professional information.

                    </p>


                  </div>


                </div>


              </div>


              <div className="staff-profile-fields two-columns">


                <ProfileField

                  label="LinkedIn"

                  value={

                    form.linkedin

                  }

                  disabled={

                    !editing

                  }

                  placeholder="LinkedIn profile URL"

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "linkedin",

                      value

                    )

                  }

                />


                <ProfileField

                  label="Twitter / X"

                  value={

                    form.twitter

                  }

                  disabled={

                    !editing

                  }

                  placeholder="Profile URL"

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "twitter",

                      value

                    )

                  }

                />


                <ProfileField

                  label="Facebook"

                  value={

                    form.facebook

                  }

                  disabled={

                    !editing

                  }

                  placeholder="Profile URL"

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "facebook",

                      value

                    )

                  }

                />


                <ProfileField

                  label="Instagram"

                  value={

                    form.instagram

                  }

                  disabled={

                    !editing

                  }

                  placeholder="Profile URL"

                  onChange={(

                    value

                  ) =>

                    updateField(

                      "instagram",

                      value

                    )

                  }

                />


              </div>


            </section>


          </div>


          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <aside className="staff-profile-side-column">


            {/* =============================================
                CONTACT INFORMATION
            ============================================= */}

            <section className="staff-profile-card">


              <div className="staff-profile-card-heading">


                <div>


                  <Mail

                    size={19}

                  />


                  <div>


                    <h3>

                      Contact Information

                    </h3>


                    <p>

                      Registered account contact details.

                    </p>


                  </div>


                </div>


              </div>


              {/* ===========================================
                  EMAIL
              =========================================== */}

              <div className="staff-contact-item">


                <div className="staff-contact-icon">


                  <Mail

                    size={18}

                  />


                </div>


                <div>


                  <span>

                    Email Address

                  </span>


                  <strong>

                    {currentEmail ||

                      "Not available"

                    }

                  </strong>


                  <small>

                    Registered email

                  </small>


                </div>


              </div>


              {/* ===========================================
                  PENDING EMAIL REQUEST
              =========================================== */}

              {pendingEmailRequest && (

                <PendingRequestStatus

                  type="EMAIL"

                  request={

                    pendingEmailRequest

                  }

                />

              )}


              {/* ===========================================
                  PHONE
              =========================================== */}

              <div className="staff-contact-item">


                <div className="staff-contact-icon">


                  <Phone

                    size={18}

                  />


                </div>


                <div>


                  <span>

                    Mobile Number

                  </span>


                  <strong>

                    {currentPhone ||

                      "Not available"

                    }

                  </strong>


                  <small>

                    Registered mobile number

                  </small>


                </div>


              </div>


              {/* ===========================================
                  PENDING PHONE REQUEST
              =========================================== */}

              {pendingPhoneRequest && (

                <PendingRequestStatus

                  type="PHONE"

                  request={

                    pendingPhoneRequest

                  }

                />

              )}


              {/* ===========================================
                  LOADING REQUESTS
              =========================================== */}

              {loadingRequests && (

                <div className="staff-contact-protection">


                  <LoaderCircle

                    size={16}

                    className="staff-spin"

                  />


                  <p>

                    Checking pending requests...

                  </p>


                </div>

              )}


              {/* ===========================================
                  APPROVAL INFORMATION
              =========================================== */}

              {canRequestContactChanges && (

                <div className="staff-contact-protection">


                  <Lock

                    size={17}

                  />


                  <p>

                    {getApprovalMessage()}

                  </p>


                </div>

              )}


              {/* ===========================================
                  SUPER ADMIN MESSAGE
              =========================================== */}

              {!canRequestContactChanges && (

                <div className="staff-contact-protection">


                  <Lock

                    size={17}

                  />


                  <p>

                    Super Admin contact information cannot be changed through this request workflow.

                  </p>


                </div>

              )}


              {/* ===========================================
                  ACTIONS
              =========================================== */}

              {canRequestContactChanges && (

                <div className="staff-contact-actions">


                  <button

                    type="button"

                    disabled={

                      loadingRequests ||

                      Boolean(

                        pendingEmailRequest

                      )

                    }

                    onClick={() =>

                      openContactRequest(

                        CONTACT_CHANGE_TYPE.EMAIL

                      )

                    }

                  >

                    {pendingEmailRequest

                      ? "Email Request Pending"

                      : "Request Email Change"

                    }

                  </button>


                  <button

                    type="button"

                    disabled={

                      loadingRequests ||

                      Boolean(

                        pendingPhoneRequest

                      )

                    }

                    onClick={() =>

                      openContactRequest(

                        CONTACT_CHANGE_TYPE.PHONE

                      )

                    }

                  >

                    {pendingPhoneRequest

                      ? "Mobile Request Pending"

                      : "Request Mobile Change"

                    }

                  </button>


                </div>

              )}


            </section>


            {/* =============================================
                ACCOUNT
            ============================================= */}

            <section className="staff-profile-card">


              <div className="staff-profile-card-heading">


                <div>


                  <CheckCircle2

                    size={19}

                  />


                  <div>


                    <h3>

                      Account

                    </h3>


                    <p>

                      NewsRoom account information.

                    </p>


                  </div>


                </div>


              </div>


              <div className="staff-account-list">


                <AccountItem

                  label="Role"

                  value={

                    getRoleLabel(

                      normalizedRole

                    )

                  }

                />


                <AccountItem

                  label="Status"

                  value={

                    profile?.accountStatus ||

                    profile?.status ||

                    "ACTIVE"

                  }

                />


                <AccountItem

                  label="Email Verification"

                  value={

                    profile?.emailVerified

                      ? "Verified"

                      : "Not Verified"

                  }

                />


                <AccountItem

                  label="Phone Verification"

                  value={

                    profile?.phoneVerified

                      ? "Verified"

                      : "Not Verified"

                  }

                />


              </div>


            </section>


            {/* =============================================
                WEBSITE
            ============================================= */}

            {form.website && (

              <section className="staff-profile-card staff-profile-website-card">


                <Globe

                  size={20}

                />


                <div>


                  <span>

                    Website

                  </span>


                  <a

                    href={

                      form.website

                    }

                    target="_blank"

                    rel="noreferrer"

                  >

                    Visit website

                  </a>


                </div>


              </section>

            )}


          </aside>


        </div>


        {/* ===============================================
            SAVE BAR
        =============================================== */}

        {editing && (

          <div className="staff-profile-save-bar">


            <div>


              <strong>

                Profile editing enabled

              </strong>


              <span>

                Save your changes when you are finished.

              </span>


            </div>


            <div>


              <button

                type="button"

                className="staff-profile-cancel-button"

                onClick={

                  cancelEdit

                }

              >

                Cancel

              </button>


              <button

                type="submit"

                className="staff-profile-save-button"

                disabled={

                  saving ||

                  uploading

                }

              >


                {saving ? (

                  <LoaderCircle

                    size={17}

                    className="staff-spin"

                  />

                ) : (

                  <Save

                    size={17}

                  />

                )}


                {saving

                  ? "Saving..."

                  : "Save Changes"

                }


              </button>


            </div>


          </div>

        )}


      </form>


      {/* =====================================================
          CONTACT CHANGE MODAL
      ===================================================== */}

      {contactModal && (

        <div className="staff-profile-modal-overlay">


          <div className="staff-profile-modal">


            <div className="staff-profile-modal-heading">


              <div>


                <h3>


                  Request{" "}

                  {contactModal ===

                  CONTACT_CHANGE_TYPE.EMAIL

                    ? "Email"

                    : "Mobile Number"

                  }{" "}

                  Change


                </h3>


                <p>


                  {isAdmin

                    ? "Your request will be reviewed by a Super Administrator."

                    : "Your request will be reviewed by an Administrator or Super Administrator."

                  }


                </p>


              </div>


              <button

                type="button"

                onClick={

                  closeContactRequest

                }

                disabled={

                  requesting

                }

              >


                <X

                  size={20}

                />


              </button>


            </div>


            <form

              onSubmit={

                submitContactRequest

              }

            >


              <label>


                New{" "}

                {contactModal ===

                CONTACT_CHANGE_TYPE.EMAIL

                  ? "Email Address"

                  : "Mobile Number"

                }


                <input

                  type={

                    contactModal ===

                    CONTACT_CHANGE_TYPE.EMAIL

                      ? "email"

                      : "tel"

                  }

                  value={

                    contactValue

                  }

                  onChange={(

                    event

                  ) =>

                    setContactValue(

                      event.target.value

                    )

                  }

                  required

                  disabled={

                    requesting

                  }

                  placeholder={

                    contactModal ===

                    CONTACT_CHANGE_TYPE.EMAIL

                      ? "Enter your new email address"

                      : "Enter your new mobile number"

                  }

                />


              </label>


              <div className="staff-profile-modal-current-value">


                <span>

                  Current Value

                </span>


                <strong>


                  {contactModal ===

                  CONTACT_CHANGE_TYPE.EMAIL

                    ? (

                        currentEmail ||

                        "Not available"

                      )

                    : (

                        currentPhone ||

                        "Not available"

                      )

                  }


                </strong>


              </div>


              <div className="staff-profile-modal-actions">


                <button

                  type="button"

                  onClick={

                    closeContactRequest

                  }

                  disabled={

                    requesting

                  }

                >

                  Cancel

                </button>


                <button

                  type="submit"

                  disabled={

                    requesting ||

                    !contactValue.trim()

                  }

                >


                  {requesting

                    ? "Submitting..."

                    : "Submit Request"

                  }


                </button>


              </div>


            </form>


          </div>


        </div>

      )}


    </div>

  );

}


/* ============================================================
   PENDING REQUEST STATUS
============================================================ */

function PendingRequestStatus({

  type,

  request,

}) {


  if (

    !request

  ) {

    return null;

  }


  const requestedValue =

    request.requestedValue ||

    request.requestedEmail ||

    request.requestedPhone ||

    "";


  return (

    <div className="staff-contact-protection">


      <Clock

        size={17}

      />


      <p>


        <strong>

          Pending {type === "EMAIL"

            ? "Email"

            : "Mobile Number"

          } Change

        </strong>


        <br />


        Requested:

        {" "}

        {requestedValue ||

          "New value"

        }


        <br />


        Waiting for approval.


      </p>


    </div>

  );

}


/* ============================================================
   FORM DATA
============================================================ */

function buildForm(

  profile = {}

) {


  return {


    name:

      profile.name ||

      profile.displayName ||

      "",


    displayName:

      profile.displayName ||

      profile.name ||

      "",


    avatar:

      profile.avatar ||

      "",


    bio:

      profile.bio ||

      "",


    about:

      profile.about ||

      "",


    website:

      profile.website ||

      "",


    address:

      profile.address ||

      "",


    city:

      profile.city ||

      "",


    state:

      profile.state ||

      "",


    country:

      profile.country ||

      "",


    postalCode:

      profile.postalCode ||

      "",


    linkedin:

      profile.linkedin ||

      "",


    twitter:

      profile.twitter ||

      "",


    facebook:

      profile.facebook ||

      "",


    instagram:

      profile.instagram ||

      "",

  };

}


/* ============================================================
   PROFILE FIELD
============================================================ */

function ProfileField({

  label,

  value,

  disabled,

  placeholder,

  onChange,

}) {


  return (

    <label className="staff-profile-field">


      <span>

        {label}

      </span>


      <input

        type="text"

        value={

          value

        }

        disabled={

          disabled

        }

        placeholder={

          placeholder

        }

        onChange={(

          event

        ) =>

          onChange(

            event.target.value

          )

        }

      />


    </label>

  );

}


/* ============================================================
   PROFILE TEXTAREA
============================================================ */

function ProfileTextarea({

  label,

  value,

  disabled,

  placeholder,

  onChange,

}) {


  return (

    <label className="staff-profile-field">


      <span>

        {label}

      </span>


      <textarea

        value={

          value

        }

        disabled={

          disabled

        }

        placeholder={

          placeholder

        }

        onChange={(

          event

        ) =>

          onChange(

            event.target.value

          )

        }

      />


    </label>

  );

}


/* ============================================================
   ACCOUNT ITEM
============================================================ */

function AccountItem({

  label,

  value,

}) {


  return (

    <div className="staff-account-item">


      <span>

        {label}

      </span>


      <strong>

        {value}

      </strong>


    </div>

  );

}