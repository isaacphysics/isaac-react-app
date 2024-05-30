import React from "react";
import { SITE_SUBJECT_TITLE } from "../../services";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

export const ConsistencyErrorModal = ({ consistencyError }: { consistencyError: boolean }) => {
  return (
    <Modal id="user-consistency-error" isOpen={consistencyError} size={"lg"}>
      <ModalHeader className="h-title pb-5 mb-4">{`Your Isaac ${SITE_SUBJECT_TITLE} session has changed`}</ModalHeader>
      <ModalBody className="px-0 mx-4">
        <h3>This browser window / tab is out of sync.</h3>
        <p className="pb-2">
          This can happen if you have logged out or logged in as another user via another browser window. Please click
          continue to avoid any issues.
        </p>
        <p>
          <em>Note:</em>
          {" If you would like to be logged in with two accounts at one time you will need to use your browser's "}
          <a href="https://en.wikipedia.org/wiki/Privacy_mode" target="_blank" rel="noopener noreferrer">
            private browsing
          </a>
          {" feature."}
        </p>
      </ModalBody>
      <ModalFooter className="mb-4 align-self-center">
        <Button color="secondary" href="/login">
          Continue
        </Button>
      </ModalFooter>
    </Modal>
  );
};
