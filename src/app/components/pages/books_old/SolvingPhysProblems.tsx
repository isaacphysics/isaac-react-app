import {Col, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {PageFragment} from "../../elements/PageFragment";

export const SolvingPhysProblems = () => {

    return <Container className="physics">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-7" currentPageTitle="How To Solve Physics Problems" />
                <PageFragment fragmentId="solve_physics_problems_intro"/>
            </div>
        </Col>
    </Container>;
};
