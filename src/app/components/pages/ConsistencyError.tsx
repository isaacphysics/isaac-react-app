import {SITE_TITLE} from "../../services";
import React from "react";
import {Button, Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

export const ConsistencyError = () => {
    return <Container>
        <TitleAndBreadcrumb breadcrumbTitleOverride="User consistency error" currentPageTitle={`Your ${SITE_TITLE} session has changed`}/>
        <h3 className="my-4">This browser window / tab is out of sync.</h3>
        <p className="pb-2">This can happen if you have logged out or logged in as another user via another browser window. Please click continue to avoid any issues.</p>
        <p>
            <em>Note:</em>
            {" If you would like to be logged in with two accounts at one time you will need to use your browser's "}
            <a href="https://en.wikipedia.org/wiki/Privacy_mode" target="_blank" rel="noopener noreferrer">
                private browsing
            </a>
            {" feature."}
        </p>
        <Button color="secondary" href="/login">Continue</Button>
    </Container>;
};
