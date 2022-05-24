import React, {useContext} from "react";
import {Alert, Container} from "reactstrap";
import {ContentErrorListContext} from "./ContentErrorBoundary";

export const ContentErrorBanner = () => {
    const contentErrors = useContext(ContentErrorListContext);

    // Only render if we have any errors
    if (!contentErrors || contentErrors.length === 0) return null;

    return <Alert color="warning" className="mb-0">
        <Container className="text-left">
            <p>This page contains the following non-critical content errors:</p>
            <ul>
                {contentErrors.map(err => <li>{err}</li>)}
            </ul>
        </Container>
    </Alert>;
}
