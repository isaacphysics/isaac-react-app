import React from "react";
import {Link} from "react-router-dom";
import {Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

export const ComingSoon = () => <Container>
    <TitleAndBreadcrumb currentPageTitle="Coming soon" />

    <Row>
        <Col>
            <p className="my-4">
                {"Some aspects of this site are still under development: the Isaac Computer Science team is working " +
                "hard behind the scenes to add new site content and features. We would love to "}
                <Link to="/contact?subject=Beta%20Feedback">hear your feedback</Link>
                {", so please get in touch."}
            </p>
            <p>
                {"We will publish multiple new topics at the start of each term, so you will have Isaac Computer Science " +
                "materials available to support your teaching throughout the year." +
                " Take a look at the "}
                <a href="/teaching_order">suggested teaching order page</a>
                {" to see when new topics will be released."}
            </p>
        </Col>
    </Row>
    <Row className="pb-4">
        <Col md="7">
            <p>
                {"In addition to publishing new content, we will also be adding new features to the platform. " +
                "This will include a progress tracker, assignments, and question gameboards. " +
                "We will also launch some new question types:"}
            </p>
            <ul>
                <li>Parsons problems</li>
                <li>Short answer natural language</li>
                <li>Boolean logic equation editor</li>
            </ul>
            <p>
                {"We intend to add the following features later in the year:"}
            </p>
            <ul>
                <li>Integrated event booking: book onto our events using your Isaac Computer Science account (Autumn 2019)</li>
                <li>The ability for teachers to build custom assignments (late 2019 – early 2020)</li>
                <li>A &lsquo;My progress&rsquo; page for students to track their completion of the resources (late 2019 – early 2020)</li>
            </ul>
        </Col>
        <Col md="5">
            <div className="text-center pt-4">
                <img src="/assets/ics_spot.svg" className="align-self-center img-fluid" alt="Student illustration" />
            </div>
        </Col>
    </Row>
</Container>;
