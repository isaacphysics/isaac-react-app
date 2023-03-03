import React from "react";
import {useLocation} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {siteSpecific} from "../../services";

const PhyNotFound = () => {
    const {pathname, state} = useLocation<{overridePathname?: string}>();
    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride="Unknown page" currentPageTitle="Page not found" />
            <h3 className="my-4">
                <small>
                    {"We're sorry, page not found: "}
                    <code>
                        {(state && state.overridePathname) || pathname}
                    </code>
                </small>
            </h3>
        </div>
    </Container>;
};

const CSNotFound = () => {
    const {pathname, state} = useLocation<{overridePathname?: string}>();
    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride="404" currentPageTitle="Page not found" />
            <p className="my-4">
                {"We're sorry, page not found: "}
                <code>
                    {(state && state.overridePathname) || pathname}
                </code>
            </p>
        </div>
    </Container>;
};

export const NotFound = siteSpecific(PhyNotFound, CSNotFound);
