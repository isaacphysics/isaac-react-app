import React, { useEffect } from "react";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {trackEvent, WEBMASTER_EMAIL} from "../../services";

export const SessionExpired = () => {
    useEffect(() => {
        trackEvent("exception", { props: { description: `session_expired`, fatal: true } });
    }, []);

    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride="Session expired error" currentPageTitle="Session expired" icon={{type: "icon", icon: "icon-error"}}/>

            <div className="my-4 h3">{"We're sorry, but your session has expired!"}</div>

            <p>
                {"You should "}
                <a
                    role="button"
                    tabIndex={0}
                    href={window.location.href}
                    onKeyPress={() => window.location.reload()}
                    onClick={() => window.location.reload()}
                >
                    refresh this page and try again
                </a>
                {", or try refreshing whilst "}
                <a href="https://en.wikipedia.org/wiki/Wikipedia:Bypass_your_cache#Bypassing_cache" target="_blank" rel="noopener noreferrer">
                    {"bypassing your browser's cache"}
                </a>
                {", which may have saved an outdated version of Isaac."}
            </p>
            <p>
                {"Please email "}
                <a href={`mailto:${WEBMASTER_EMAIL}`}>{WEBMASTER_EMAIL}</a>
                {" if this keeps happening."}
            </p>
        </div>
    </Container>;
};
