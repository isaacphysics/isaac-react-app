import React from "react";
import * as RS from "reactstrap";

export const ConsistencyErrorModal = ({consistencyError}: {consistencyError: boolean}) => {
    return <RS.Modal isOpen={consistencyError}>
        <RS.ModalHeader>Your Isaac Computer Science session has changed</RS.ModalHeader>
        <RS.ModalBody>
            <h3>This browser window / tab is out of sync.</h3>
            <p className="pb-2">This can happen if you have logged out or logged in as another user via another browser window. Please click continue to avoid any issues.</p>
            <p><em>Note:</em> If you would like to be logged in with two accounts at one time you will need to use your browser&apos;s <a href="https://en.wikipedia.org/wiki/Privacy_mode">private browsing</a> feature.</p>
        </RS.ModalBody>
        <RS.ModalFooter>
            <RS.Button color="primary" href="/login">Continue</RS.Button>
        </RS.ModalFooter>
    </RS.Modal>;
};