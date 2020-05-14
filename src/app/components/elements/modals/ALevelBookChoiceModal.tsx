import {store} from "../../../state/store";
import {closeActiveModal} from "../../../state/actions";
import React from "react";
import {Col, Row} from "reactstrap";
import {Link} from "react-router-dom";

export const aLevelBookChoiceModal = () => {

    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Mastering Essential Pre-University Physics",
        body: <React.Fragment>
            <Col>
                <Row className="justify-content-md-center">
                    <Col className="text-center" md={4}>
                        <Link onClick={store.dispatch(closeActiveModal())} to="/books/physics_skills_14">
                            <img className="book-cover" src="assets/phy/books/physics_skills_14.jpg" alt="" />
                            <span className="sr-only">Pre-university Physics </span><span>2nd Edition (2014-2018)</span>
                        </Link>
                    </Col>
                    <Col className="text-center" md={4}>
                        <Link onClick={store.dispatch(closeActiveModal())} to="/books/physics_skills_19">
                            <img className="book-cover" src="assets/phy/books/physics_skills_19.jpg" alt="" />
                            <span className="sr-only">Pre-university Physics </span><span>3rd Edition (2019-)</span>
                        </Link>
                    </Col>
                </Row>
            </Col>
        </React.Fragment>
    }
};
