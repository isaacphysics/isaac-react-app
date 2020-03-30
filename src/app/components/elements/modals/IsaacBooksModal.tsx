import {store} from "../../../state/store";
import {closeActiveModal, openALevelBookChoiceModal} from "../../../state/actions";
import React from "react";
import {Col, Row} from "reactstrap";

function openBookChoice() {
    store.dispatch(closeActiveModal());
    store.dispatch(openALevelBookChoiceModal());
}

export const isaacBooksModal = () => {

    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Isaac Skills Books",
        body: <React.Fragment>
            <Col>
                <Row>
                    <h4>Mastering Essential...</h4>
                </Row>
                <Row>
                    <Col className="text-center" md={4}>
                        <a href="/books/phys_book_gcse"><img className="book-cover" src="assets/phy/books/phys_book_gcse.jpg" alt="GCSE Physics book cover" /><span>GCSE Physics</span></a>
                    </Col>
                    <Col className="text-center" md={4}>
                        <button className="book-link" onClick={openBookChoice}>
                            <img className="book-cover" src="assets/phy/books/physics_skills_14.jpg" alt="A-Level Physics book cover" /><span>Pre-University Physics</span></button>
                    </Col>
                    <Col className="text-center" md={4}>
                        <a href="/books/chemistry_16"><img className="book-cover" src="assets/phy/books/chemistry_16.jpg" alt="Chemistry book cover" /><span>Pre-University Physical Chemistry</span></a>
                    </Col>
                </Row>
                <Row>
                    <h4>or</h4>
                </Row>
                <Row>
                    <Col className="text-center" md={4}>
                        <a href="/books/pre_uni_maths"><img className="book-cover" src="assets/phy/books/pre_uni_maths.jpg" alt="Maths book cover" /><span>Mathematics for Sciences</span></a>
                    </Col>
                </Row>
            </Col>
        </React.Fragment>
    }
};
