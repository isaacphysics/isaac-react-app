import {store} from "../../../state/store";
import {closeActiveModal} from "../../../state/actions";
import React from "react";
import {Col, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {useDispatch} from "react-redux";

const ALevelModalBody = () => {

    const dispatch = useDispatch();

    return <React.Fragment>
        <Col>
            <Row className="justify-content-md-center">
                <Col className="text-center" md={4}>
                    <Link onClick={() => dispatch(closeActiveModal())} to="/books/physics_skills_14">
                        <img className="book-cover" src="assets/phy/books/physics_skills_14.jpg" alt="" />
                        <span className="sr-only">Pre-university Physics </span><span>2nd Edition (2014-2018)</span>
                    </Link>
                </Col>
                <Col className="text-center" md={4}>
                    <Link onClick={() => dispatch(closeActiveModal())} to="/books/physics_skills_19">
                        <img className="book-cover" src="assets/phy/books/physics_skills_19.jpg" alt="" />
                        <span className="sr-only">Pre-university Physics </span><span>3rd Edition (2019-)</span>
                    </Link>
                </Col>
            </Row>
        </Col>
    </React.Fragment>
};

export const aLevelBookChoiceModal = () => {

    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Mastering Essential Pre-University Physics",
        body: <ALevelModalBody/>
    }
};
