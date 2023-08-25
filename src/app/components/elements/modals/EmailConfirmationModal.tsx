import {
  closeActiveModal,
  requestEmailVerification,
  selectors,
  useAppDispatch,
  useAppSelector,
} from "../../../state";
import { Button, CardBody } from "reactstrap";
import React from "react";
import { Link } from "react-router-dom";
import { WEBMASTER_EMAIL } from "../../../services";

const EmailConfirmationModalBody = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectors.user.orNull);
  const status = (user?.loggedIn && user?.emailVerificationStatus) || null;
  
  function clickVerify() {
    dispatch(requestEmailVerification());
    dispatch(closeActiveModal());
  }

  return (
    <CardBody className="p-0" id="email-verification-modal">
      {status === "NOT_VERIFIED" && (
        <>
          <p>
            Your email address needs to be verified - please find our email in
            your inbox and follow the verification link.
          </p>
          <p>
            You can request a new verification email if necessary:
          </p>
          <div className="text-center pb-3">
            <Button
            id="email-verification-request"
            className="btn btn-secondary border-0 px-2 my-1"
            onClick={clickVerify}
            >
              Re-send email
            </Button>
          </div>
        </>
      )}
      {status === "DELIVERY_FAILED" && (
        <>
          <p>
            One or more email(s) sent to your email address failed. This means
            you won&apos;t receive emails from Isaac, and may prevent you
            regaining access to your account.{" "}
          </p>
          <p className="pb-3">
            To start receiving emails again, update your email address on your{" "}
            <Link to="/account">My account</Link> page. If you believe this is
            in error, please <a href={`mailto:${WEBMASTER_EMAIL}`}>email us</a>.
          </p>
        </>
      )}
    </CardBody>
  );
};

export const emailConfirmationModal = {
  title: "Verify your email address",
  body: <EmailConfirmationModalBody />,
};
