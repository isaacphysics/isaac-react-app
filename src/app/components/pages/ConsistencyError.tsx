import {KEY, persistence, SITE_TITLE} from "../../services";
import React, {useEffect, useState} from "react";
import {Button, Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

export const ConsistencyError = () => {

    const [target, setTarget] = useState<string>("/login");

    useEffect(() => {
        const targetFromSessionStorage = persistence.session.load(KEY.AFTER_SESSION_RENEW_PATH);

        // Set the target of the Continue button
        if(targetFromSessionStorage) setTarget(targetFromSessionStorage);
    }, []);

    return <Container className="mb-3">
        <TitleAndBreadcrumb breadcrumbTitleOverride="User consistency error" currentPageTitle={`Your ${SITE_TITLE} session has changed`} icon={{type: "hex", icon: "icon-error"}}/>
        <p className="pb-2">You have logged out in another tab or browser window, so we&#39;ve logged you out here. Use the button below to continue where you left off.</p>
        <p>
            <b>Tip:</b>
            {" If you want to be logged in to two accounts at the same time, you can use your browser's "}
            <a href="https://en.wikipedia.org/wiki/Privacy_mode" target="_blank" rel="noopener noreferrer">
                private browsing
            </a>
            {" feature."}
        </p>
        <Button color="secondary" href={target}>Continue</Button>
    </Container>;
};
