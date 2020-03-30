import React from "react";
import {Alert, Container} from "reactstrap";
import {SITE_SUBJECT_TITLE} from "../../services/siteConstants";
import {Link} from "react-router-dom";

// Before deleting, it might be worth altering this to be more generic and controlled by content on ElasticSearch
export const CoronavirusWarningBanner = () => (
    <Alert color="warning" className="mb-0">
        <Container className="text-center">
            All Isaac {` ${SITE_SUBJECT_TITLE} `} face-to-face events are suspended due to concerns related to coronavirus.{" "}
            <Link to="/pages/2020_events_coronavirus_update">Find out more <span className="sr-only"> about event cancellations</span> here</Link>.
        </Container>
    </Alert>
);
