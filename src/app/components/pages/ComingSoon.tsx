import React from "react";
import {Link} from "react-router-dom";
import {Col, Container, Row} from "reactstrap";
import {BreadcrumbTrail} from "../content/BreadcrumbTrail";

export const ComingSoon = () => <Container>
    <BreadcrumbTrail currentPageTitle="Coming Soon" />

    <h1 className="h-title">Coming Soon</h1>

    <Row>
        <Col>
            <p className="my-4">
                {"Some aspects of this site are still under development: the Isaac Computer Science team is working" +
                "hard behind the scenes to add new site content and features. We would love to "}
                <Link to="/contact">hear your feedback</Link>
                {", so please get in touch."}
            </p>
        </Col>
    </Row>
    <Row className="pb-4">
        <Col md="6">
            <p>You can look forward to the following features:</p>
            <strong>July 2019</strong>
            <p>
                Progress tracker, assignments, and game board features.
            </p>
            <strong>September 2019</strong>
            <p>
                A wider variety of programming, theory topics, and questions, including new question types:
                <ul>
                    <li>Parsons problems</li>
                    <li>Natural language</li>
                    <li>Boolean equation editor</li>
                </ul>
            </p>
            <strong>November 2019</strong>
            <p>
                More platform features; all topic and question content available, providing full coverage of
                OCR and AQA A level specifications.
            </p>
        </Col>
        <Col md="6">
            <div className="text-center pt-4">
                <img src="/assets/ics_spot.svg" className="align-self-center img-fluid" alt="Student illustration" />
            </div>
        </Col>
    </Row>
</Container>;
