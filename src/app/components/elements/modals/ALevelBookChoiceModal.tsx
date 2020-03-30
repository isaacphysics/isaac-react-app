import {store} from "../../../state/store";
import {closeActiveModal} from "../../../state/actions";
import React from "react";
import {Col, Row} from "reactstrap";

export const aLevelBookChoiceModal = () => {

    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Mastering Essential Pre-University Physics",
        body: <React.Fragment>
            <Col>
                <Row className="justify-content-md-center">
                    <Col className="text-center" md={4}>
                        <a href="/books/physics_skills_14">
                            <img className="book-cover" src="assets/phy/books/physics_skills_14.jpg" alt="2nd Edition A-Level Physics book cover" />
                            <span>2nd Edition (2014-2018)</span>
                        </a>
                    </Col>
                    <Col className="text-center" md={4}>
                        <a href="/books/physics_skills_19">
                            <img className="book-cover" src="assets/phy/books/physics_skills_19.jpg" alt="3rd Edition A-Level Physics book cover" />
                            <span>3rd Edition (2019-)</span>
                        </a>
                    </Col>
                </Row>
            </Col>
        </React.Fragment>
    }
};
