import React from "react";
import {useLocation} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {siteSpecific, WEBMASTER_EMAIL} from "../../services";

const buildContactUrl = (state: {overridePathname?: string}, pathname: string) => {
    const page = encodeURIComponent((state && state.overridePathname) || pathname);
    return `/contact?preset=notFound&page=${page}`;
};

export const NotFound = () => {
    const {pathname, state} = useLocation<{overridePathname?: string}>();
    return <Container>
        <div className="pb-1">
            <TitleAndBreadcrumb
                breadcrumbTitleOverride={siteSpecific("Unknown page", "404")}
                currentPageTitle={window.navigator.onLine ? "Page not found" : "No internet"}
                icon={{type: "icon", icon: "icon-error"}}
            />
            <p className="my-4">
                {"We're sorry, page not found: "}
                <code>
                    {(state && state.overridePathname) || pathname}
                </code>
            </p>

            {window.navigator.onLine ?
                <p>
                    Expecting to find something here?
                    <a className="ps-1" href={buildContactUrl(state, pathname)} >
                        Let us know<span className="visually-hidden"> about this missing page</span>
                    </a>.
                </p> :
                <p>
                    It looks like you&apos;re offline. You may want to check your internet connection, and then refresh this page to try again.
                    <br />
                    If you are still having issues, please <a href={`mailto:${WEBMASTER_EMAIL}`}>let us know</a>.
                </p> // Email link rather than contact form, as the contact form may not work offline
            }
        </div>
    </Container>;
};
