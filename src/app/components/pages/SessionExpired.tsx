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

            <h3 className="my-4"><small>{"We're sorry, but your session has expired!"}</small></h3>

            <h3>
                <small>
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
                </small>
            </h3>
            <h3>
                <small>
                    {"Please email "}
                    <a href={`mailto:${WEBMASTER_EMAIL}`}>{WEBMASTER_EMAIL}</a>
                    {" if this keeps happening."}
                </small>
            </h3>
        </div>
    </Container>;
};
