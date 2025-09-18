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
        We’ve clarified that Isaac Computer Science is part of the National Centre for Computing Education (NCCE), which
        data we collect (for example, your school), how long we keep it for programme evaluation, and how to contact us.
      </p>
      <p>To continue using the platform, you&apos;ll need to review and accept the updated Privacy Policy.</p>
      <p>
        <a href="/privacy" rel="noopener noreferrer">
          View the updated Privacy Policy
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
