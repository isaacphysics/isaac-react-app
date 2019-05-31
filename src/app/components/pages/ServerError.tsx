import React from "react";
import {Link} from "react-router-dom";
import {Container} from "reactstrap";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";

export const ServerError = () => {
    return <Container>
        <div>
            <BreadcrumbTrail currentPageTitle="Error" />
            <h1 className="h-title">Error</h1>

            <h3 className="my-4"><small>{"We're sorry, but an error has occurred on the Isaac server!"}</small></h3>

            <h3>
                <small>
                    {"You may want to "}
                    {/* TODO accessibility of this anchor element can be improved */}
                    <a
                        role="button"
                        tabIndex={0}
                        onKeyPress={() => window.location.reload(true)}
                        onClick={() => window.location.reload(true)}
                    >
                        refresh this page and try again
                    </a>
                    {", "}
                    <Link to="/home">
                        return to our homepage
                    </Link>
                    {", or "}
                    <Link to="/contact">
                        contact
                    </Link>
                    {" or "}
                    <a href="mailto:webmaster@isaacphysics.org">
                        email
                    </a>
                    {" us if this keeps happening."}
                </small>
            </h3>
        </div>
    </Container>;
};
