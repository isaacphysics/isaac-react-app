import {closeActiveModal, store, useAppDispatch} from "../../../state";
import React from "react";
import {Col, Row} from "reactstrap";
import {Link} from "react-router-dom";
import { ISAAC_BOOKS, BookInfo } from "../../../services";

export const BookModalBody = () => {
    const dispatch = useAppDispatch();

    return <Row className={"pb-2 justify-content-center"}>
        {ISAAC_BOOKS.map((book: BookInfo) => <Col key={book.title} className="mb-3" lg={3} sm={6}>
            <Link className={"text-center w-100"} onClick={() => dispatch(closeActiveModal())} to={book.path}>
                <img className="ms-auto me-auto book-cover-small" src={book.image} alt="" />
                <span>{book.title}</span>
            </Link>
        </Col>)}
    </Row>;
};

export const isaacBooksModal = () => ({
    closeAction: () => {store.dispatch(closeActiveModal());},
    title: "Isaac Skills Books",
    body: <BookModalBody/>
});
