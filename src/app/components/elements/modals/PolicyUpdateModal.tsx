import React from "react";
import { closeActiveModal, store, updatePrivacyPolicyAcceptedTime } from "../../../state";
import { Button } from "reactstrap";

// N.B. This modal must not be referenced in index.tsx to avoid circular dependencies

export const policyUpdateModal = {
  closeAction: () => {
    // do nothing as user should not be able to avoid accepting the policy
  },
  title: "We've updated our Privacy Policy",
  body: (
    <>
      <p>
        With this update, we have clarified the role of National Center for Computing Education (NCCE), the types of
        data we collect (such as your school affiliation), how to contact us, and the date we will keep your personal
        data until for the purposes of evaluation of the Isaac Computer Science Program.
      </p>
      <p>
        To continue using the platform, you&apos;ll need to review and accept the updated{" "}
        <a href="/privacy" rel="noopener noreferrer">
          Privacy Policy
        </a>
        {"."}
      </p>
      <p>
        <a href="/privacy" rel="noopener noreferrer">
          View Privacy Policy
        </a>
      </p>
    </>
  ),
  buttons: [
    // eslint-disable-next-line react/jsx-key
    <Button
      key={0}
      size="lg"
      color="secondary"
      target="_blank"
      block
      style={{
        fontWeight: "800 !important",
      }}
      onClick={() => {
        // Update privacy policy acceptance with current timestamp
        store.dispatch(
          updatePrivacyPolicyAcceptedTime({
            privacyPolicyAcceptedTime: Date.now(),
          }),
        );
        store.dispatch(closeActiveModal());
      }}
    >
      Agree and Continue
    </Button>,
  ],
  isCloseable: false,
};
