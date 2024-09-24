import React, {useEffect} from "react";
import {Button, Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {SITE_TITLE, trackEvent} from "../../services";

export const SessionCookieExpired = () => {
    useEffect(() => {
        trackEvent("exception", { props: { description: `cookie_expired`, fatal: true } });
    }, []);

    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride="Session expired" currentPageTitle="Your session has expired"/>
            <p className="pb-2">{`Sorry, your ${SITE_TITLE} session has expired. Please log in again to continue.`}</p>
            <Button color="primary" href="/login">Back to login</Button>
        </div>
    </Container>;
};
