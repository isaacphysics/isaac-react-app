import React from "react";
import {Alert, Container} from "reactstrap";
import {SITE_SUBJECT_TITLE} from "../../services";

// Before deleting, it might be worth altering this to be more generic and controlled by content on ElasticSearch
export const CoronavirusWarningBanner = () => (
    <Alert color="warning" className="mb-0">
        <Container className="text-center">
            All Isaac {` ${SITE_SUBJECT_TITLE} `} events will be held online until further notice.
        </Container>
    </Alert>
);
