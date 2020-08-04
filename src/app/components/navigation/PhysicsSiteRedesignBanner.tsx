import React from "react";
import {Alert, Container} from "reactstrap";
import {Link} from "react-router-dom";

export const PhysicsSiteRedesignBanner = () => (
    <Alert color="warning" className="mb-0 py-3">
        <Container className="text-center">
            <b>{"Welcome to the new-look Isaac Physics site! "}</b>
            <Link to="/pages/new_site_2020">Click here to find out what has changed<span className="sr-only"> in the site redesign</span></Link>.
        </Container>
    </Alert>
);
