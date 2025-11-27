import {SITE_TITLE} from "../../services";
import React from "react";
import {Button, Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useSessionExpired} from "../../services";

export const ConsistencyError = () => {

    const [target, clearRenewPath] = useSessionExpired();

    return <Container>
        <TitleAndBreadcrumb breadcrumbTitleOverride="User consistency error" currentPageTitle={`Your ${SITE_TITLE} session has changed`} icon={{type: "icon", icon: "icon-error"}} className="mb-4" />
        <p className="pb-2">You have logged out in another tab or browser window, so we&#39;ve logged you out here. Use the button below to continue where you left off.</p>
        <p>
            <b>Tip:</b>
            {" If you want to be logged in to two accounts at the same time, you can use your browser's "}
            <a href="https://en.wikipedia.org/wiki/Privacy_mode" target="_blank" rel="noopener noreferrer">
                private browsing
            </a>
            {" feature."}
        </p>
        <Button color="secondary" onClick={clearRenewPath} href={target}>Continue</Button>
    </Container>;
};
