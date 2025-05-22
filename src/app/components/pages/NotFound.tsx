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
        <div className="pb-1">
            <TitleAndBreadcrumb
                breadcrumbTitleOverride={siteSpecific("Unknown page", "404")}
                currentPageTitle={window.navigator.onLine ? "Page not found" : "No internet"}
                icon={{type: "hex", icon: "icon-error"}}
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
                    It looks like you&apos;re offline. Please check your internet connection.
                </p>
            }
        </div>
    </Container>;
};
