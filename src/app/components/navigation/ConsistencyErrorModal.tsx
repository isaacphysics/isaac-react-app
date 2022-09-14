import React from "react";
import * as RS from "reactstrap";
import {SITE_SUBJECT_TITLE} from "../../services";

export const ConsistencyErrorModal = ({consistencyError}: {consistencyError: boolean}) => {
    return <RS.Modal id="user-consistency-error" isOpen={consistencyError} size={"lg"}>
        <RS.ModalHeader className="h-title pb-5 mb-4">
            {`Your Isaac ${SITE_SUBJECT_TITLE} session has changed`}
        </RS.ModalHeader>
        <RS.ModalBody className="px-0 mx-4">
            <h3>This browser window / tab is out of sync.</h3>
            <p className="pb-2">This can happen if you have logged out or logged in as another user via another browser window. Please click continue to avoid any issues.</p>
            <p>
                <em>Note:</em>
                {" If you would like to be logged in with two accounts at one time you will need to use your browser's "}
                <a href="https://en.wikipedia.org/wiki/Privacy_mode" target="_blank" rel="noopener noreferrer">
                    private browsing
                </a>
                {" feature."}
            </p>
        </RS.ModalBody>
        <RS.ModalFooter className="mb-4 align-self-center">
            <RS.Button color="secondary" href="/login">Continue</RS.Button>
        </RS.ModalFooter>
    </RS.Modal>;
};
