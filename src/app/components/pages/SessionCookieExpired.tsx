import React, {useEffect, useState} from "react";
import {Button, Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {KEY, persistence, SITE_TITLE, trackEvent} from "../../services";

export const SessionCookieExpired = () => {

    const [target, setTarget] = useState<string>("/login");

    useEffect(() => {
        trackEvent("exception", { props: { description: `cookie_expired`, fatal: true } });

        const targetFromSessionStorage = persistence.session.load(KEY.AFTER_SESSION_RENEW_PATH);
        if(targetFromSessionStorage) setTarget(targetFromSessionStorage);
    }, []);

    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride="Session expired" currentPageTitle="Your session has expired" icon={{type: "hex", icon: "icon-error"}}/>
            <p className="pb-2">{`Your ${SITE_TITLE} session has expired, so we've logged you out. Use the button below to continue where you left off.`}</p>
            <Button color="solid" href={target}>Continue</Button>
        </div>
    </Container>;
};
