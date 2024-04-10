import React from "react";
import {useLocation} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {siteSpecific} from "../../services";

const buildContactUrl = (state: {overridePathname?: string}, pathname: string) => {
    const page = encodeURIComponent((state && state.overridePathname) || pathname);
    return `/contact?preset=notFound&page=${page}`;
};

export const NotFound = () => {
    const {pathname, state} = useLocation<{overridePathname?: string}>();
    return <Container>
        <div>
            <TitleAndBreadcrumb
                breadcrumbTitleOverride={siteSpecific("Unknown page", "404")}
                currentPageTitle="Page not found"
            />
            <p className="my-4">
                {"We're sorry, page not found: "}
                <code>
                    {(state && state.overridePathname) || pathname}
                </code>
            </p>
            <p>
                Expecting to find something here?
                <a className="pl-1" href={buildContactUrl(state, pathname)} >
                    Let us know <span className="sr-only">about this missing page</span>
                </a>.
            </p>
        </div>
    </Container>;
};
