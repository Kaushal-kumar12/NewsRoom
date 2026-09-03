// src/components/profile/ProfileChangeRequestCard.jsx

import React, {
  useState,
} from "react";


import {

  Check,

  Clock,

  Eye,

  Mail,

  Phone,

  User,

  X,

} from "lucide-react";


export default function ProfileChangeRequestCard({

  request,

  onApprove,

  onReject,

  onViewUser,

  loading = false,

}) {


  const [

    rejectMode,

    setRejectMode,

  ] = useState(false);


  const [

    rejectionReason,

    setRejectionReason,

  ] = useState("");


  /*
   * Do not render anything
   * when there is no request.
   */

  if (

    !request

  ) {

    return null;

  }


  /*
   * REQUEST STATUS
   */

  const status =

    String(

      request.status ||

      "PENDING"

    )

      .trim()

      .toUpperCase();


  /*
   * USER INFORMATION
   */

  const userName =

    request.userName ||

    request.requesterName ||

    "User";


  const userRole =

    request.userRole ||

    request.role ||

    "";


  /*
   * DETECT REQUESTED CHANGES
   *
   * The service may explicitly
   * provide emailChanged/phoneChanged.
   *
   * We also support requestedEmail
   * and requestedPhone as fallback.
   */

  const emailChanged =

    request.emailChanged === true ||

    Boolean(

      request.requestedEmail

    );


  const phoneChanged =

    request.phoneChanged === true ||

    Boolean(

      request.requestedPhone

    );


  /*
   * CHECK WHETHER REQUEST
   * IS STILL PENDING.
   */

  const isPending =

    status === "PENDING";


  /*
   * APPROVE REQUEST
   */

  async function handleApprove() {


    if (

      loading ||

      !isPending ||

      typeof onApprove !== "function"

    ) {

      return;

    }


    await onApprove(

      request

    );

  }


  /*
   * OPEN REJECT MODE
   */

  function handleOpenRejectMode() {


    if (

      loading ||

      !isPending

    ) {

      return;

    }


    setRejectMode(

      true

    );

  }


  /*
   * CANCEL REJECTION
   */

  function handleCancelReject() {


    if (

      loading

    ) {

      return;

    }


    setRejectMode(

      false

    );


    setRejectionReason(

      ""

    );

  }


  /*
   * CONFIRM REJECTION
   */

  async function handleReject() {


    if (

      loading ||

      !isPending ||

      typeof onReject !== "function"

    ) {

      return;

    }


    await onReject(

      request,

      rejectionReason.trim()

    );


    setRejectMode(

      false

    );


    setRejectionReason(

      ""

    );

  }


  /*
   * VIEW FULL USER
   */

  function handleViewUser() {


    if (

      loading ||

      typeof onViewUser !== "function"

    ) {

      return;

    }


    onViewUser(

      request

    );

  }


  /*
   * FORMAT ROLE
   */

  function formatRole(

    role

  ) {


    if (

      !role

    ) {

      return "";

    }


    return String(

      role

    )

      .replace(

        /_/g,

        " "

      )

      .toLowerCase()

      .replace(

        /\b\w/g,

        (

          character

        ) =>

          character.toUpperCase()

      );

  }


  return (

    <div className="profile-change-request-card">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="profile-change-request-header">


        <div>


          <div className="profile-request-title">


            <Clock

              size={19}

            />


            <strong>

              Pending Contact Change Request

            </strong>


          </div>


          <p>


            {userName}

            {userRole && (

              <>

                {" "}

                ({formatRole(userRole)})

              </>

            )}

            {" "}

            requested changes to their contact information.


          </p>


        </div>


        <span

          className="profile-request-status"

        >


          {status === "PENDING"

            ? "Pending"

            : formatRole(status)}


        </span>


      </div>


      {/* =====================================================
          REQUESTER INFORMATION
      ===================================================== */}

      <div className="profile-request-user">


        <User

          size={16}

        />


        <span>

          Requested by:

          {" "}

          <strong>

            {userName}

          </strong>


          {userRole && (

            <>

              {" "}

              ·

              {" "}

              {formatRole(userRole)}

            </>

          )}

        </span>


      </div>


      {/* =====================================================
          CHANGE DETAILS
      ===================================================== */}

      <div className="profile-request-details">


        {/* =================================================
            EMAIL CHANGE
        ================================================= */}

        {emailChanged && (

          <div className="profile-request-change">


            <div className="profile-request-change-label">


              <Mail

                size={16}

              />


              <span>

                Email Address

              </span>


            </div>


            <div className="profile-request-change-values">


              <del>


                {request.currentEmail ||

                  "Not available"}


              </del>


              <strong>

                →

              </strong>


              <b>


                {request.requestedEmail ||

                  "Not available"}


              </b>


            </div>


          </div>

        )}


        {/* =================================================
            PHONE CHANGE
        ================================================= */}

        {phoneChanged && (

          <div className="profile-request-change">


            <div className="profile-request-change-label">


              <Phone

                size={16}

              />


              <span>

                Phone Number

              </span>


            </div>


            <div className="profile-request-change-values">


              <del>


                {request.currentPhone ||

                  "Not available"}


              </del>


              <strong>

                →

              </strong>


              <b>


                {request.requestedPhone ||

                  "Not available"}


              </b>


            </div>


          </div>

        )}


        {/* ===============================================
            FALLBACK
        =============================================== */}

        {!emailChanged &&

          !phoneChanged && (

            <div className="profile-request-no-changes">


              No contact changes were found in this request.

            </div>

          )}


      </div>


      {/* =====================================================
          REJECTION BOX
      ===================================================== */}

      {rejectMode &&

        isPending && (

          <div className="profile-rejection-box">


            <label>

              Rejection Reason

              <span>

                (Optional)

              </span>

            </label>


            <textarea

              value={

                rejectionReason

              }

              onChange={(

                event

              ) =>


                setRejectionReason(

                  event.target.value

                )

              }


              placeholder="Enter a reason for rejecting this request..."


              disabled={

                loading

              }

            />


            <div className="profile-rejection-actions">


              <button

                type="button"

                onClick={

                  handleCancelReject

                }

                disabled={

                  loading

                }

              >

                Cancel

              </button>


              <button

                type="button"

                className="profile-reject-confirm"

                disabled={

                  loading

                }

                onClick={

                  handleReject

                }

              >


                <X

                  size={16}

                />


                {loading

                  ? "Processing..."

                  : "Confirm Rejection"}


              </button>


            </div>


          </div>

        )}


      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="profile-request-actions">


        {/* =================================================
            VIEW USER
        ================================================= */}

        {typeof onViewUser === "function" && (

          <button

            type="button"

            className="profile-view-user-button"

            onClick={

              handleViewUser

            }

            disabled={

              loading

            }

          >


            <Eye

              size={17}

            />


            View Full User


          </button>

        )}


        {/* =================================================
            APPROVAL / REJECTION
        ================================================= */}

        {isPending && (

          <div className="profile-request-right-actions">


            {!rejectMode && (

              <button

                type="button"

                className="profile-reject-button"

                disabled={

                  loading

                }

                onClick={

                  handleOpenRejectMode

                }

              >


                <X

                  size={17}

                />


                Reject


              </button>

            )}


            {!rejectMode && (

              <button

                type="button"

                className="profile-approve-button"

                disabled={

                  loading

                }

                onClick={

                  handleApprove

                }

              >


                <Check

                  size={17}

                />


                {loading

                  ? "Processing..."

                  : "Approve"}


              </button>

            )}


          </div>

        )}


      </div>


    </div>

  );

}