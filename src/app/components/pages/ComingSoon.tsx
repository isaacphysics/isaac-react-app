import React from "react";
import {Col, Container, Row} from "reactstrap";

export const ComingSoon = () => <Container>

    <h1 className="h-title">Coming Soon</h1>

    <Row>
        <Col>
            <p className="my-4">This site is currently in development and the Isaac Computer Science team is currently working hard behind the scenes to add new content and features. We would love to [hear your feedback] -link so please get in touch.</p>

            <p>You can look forward to the following features being added to the site in the months to come:</p>

            <ul className="list-unstyled">
                <li><strong>July 2019</strong> - Progress tracker, assignments and game board features added to the site.</li>
                <li><strong>September 2019</strong> - A wide variety of programming and theory topics available, with full coverage of OCR and AQA A level specifications and accompanying questions.</li>
                <li><strong>November 2019</strong> - All content available.</li>
            </ul>
        </Col>
    </Row>
</Container>;
