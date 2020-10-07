import {store} from "../../../state/store";
import {closeActiveModal, openALevelBookChoiceModal} from "../../../state/actions";
import React from "react";
import {Col, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {useDispatch} from "react-redux";

function openBookChoice() {
    store.dispatch(closeActiveModal());
    store.dispatch(openALevelBookChoiceModal());
}

export const BookModalBody = () => {
    const dispatch = useDispatch();

    return <React.Fragment>
        <Col>
            <Row>
                <h4>Mastering Essential...</h4>
            </Row>
            <Row>
                <Col className="text-center" md={4}>
                    <Link onClick={() => dispatch(closeActiveModal())} to="/books/phys_book_gcse"><img className="book-cover" src="assets/phy/books/phys_book_gcse.jpg" alt="" />
                        <span className="sr-only">Mastering Essential </span><span>GCSE Physics</span>
                    </Link>
                </Col>
                <Col className="text-center" md={4}>
                    <button className="book-link" onClick={openBookChoice}>
                        <img className="book-cover" src="assets/phy/books/physics_skills_14.jpg" alt="" />
                        <span className="sr-only">Mastering Essential </span><span>Pre-University Physics</span>
                    </button>
                </Col>
                <Col className="text-center" md={4}>
                    <Link onClick={() => dispatch(closeActiveModal())} to="/books/chemistry_16"><img className="book-cover" src="assets/phy/books/chemistry_16.jpg" alt="" />
                        <span className="sr-only">Mastering Essential </span><span>Pre-University Physical Chemistry</span>
                    </Link>
                </Col>
            </Row>
            <Row>
                <h4>or</h4>
            </Row>
            <Row>
                <Col className="text-center" md={4}>
                    <Link onClick={() => dispatch(closeActiveModal())} to="/books/pre_uni_maths"><img className="book-cover" src="assets/phy/books/pre_uni_maths.jpg" alt="" />
                        <span className="sr-only">Pre-university </span><span>Mathematics for Sciences</span>
                    </Link>
                </Col>
            </Row>
        </Col>
    </React.Fragment>
};

export const isaacBooksModal = () => {

    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Isaac Skills Books",
        body: <BookModalBody/>
    }
};
