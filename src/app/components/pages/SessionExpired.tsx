import React from "react";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

export const SessionExpired = () => {
    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride="Session expired error" currentPageTitle="Session Expired"/>

            <h3 className="my-4"><small>{"We're sorry, but your session has expired!"}</small></h3>

            <h3>
                <small>
                    {"You should try to "}
                    {/* TODO accessibility of this anchor element can be improved */}
                    <a
                        role="button"
                        tabIndex={0}
                        onKeyPress={() => window.location.reload(true)}
                        onClick={() => window.location.reload(true)}
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
                    <a href="mailto:webmaster@isaacphysics.org">webmaster@isaacphysics.org</a>
                    {" if this keeps happening."}
                </small>
            </h3>
        </div>
    </Container>;
};
