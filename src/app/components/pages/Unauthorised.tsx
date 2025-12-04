import React from "react";
import {useLocation} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

export const Unauthorised = () => {
    const {pathname, state} = useLocation<{overridePathname?: string}>();
    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride="Unauthorised" currentPageTitle="Access denied" icon={{type: "icon", icon: "icon-error"}} />
            <h3 className="my-4">
                <small>
                    {"You do not have authorisation to access the page: "}
                    <code>
                        {(state && state.overridePathname) || pathname}
                    </code>
                </small>
            </h3>
        </div>
    </Container>;
};
