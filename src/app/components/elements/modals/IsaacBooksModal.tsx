import {store} from "../../../state/store";
import {closeActiveModal} from "../../../state/actions";
import React from "react";
import {Col, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {useDispatch} from "react-redux";
import {siteSpecific} from "../../../services/siteConstants";

interface BookInfo {
    title: string;
    image: string;
    path: string;
}

const isaacBooks: BookInfo[] = siteSpecific(
    [
        {
            title: "Step up to GCSE Physics",
            image: "assets/phy/books/step_up_phys.jpg",
            path: "/books/step_up_phys"
        },
        {
            title: "GCSE Physics",
            image: "assets/phy/books/phys_book_gcse.jpg",
            path: "/books/phys_book_gcse"
        },
        {
            title: "Pre-University Physics",
            image: "assets/phy/books/physics_skills_19.jpg",
            path: "/books/physics_skills_19"
        },
        {
            title: "Linking Concepts in Pre-University Physics",
            image: "assets/phy/books/linking_concepts.png",
            path: "/books/linking_concepts"
        },
        {
            title: "Using Essential GCSE Mathematics",
            image: "assets/phy/books/2021_maths_book_gcse.jpg",
            path: "/books/maths_book_gcse"
        },
        {
            title: "Mathematics for Sciences",
            image: "assets/phy/books/pre_uni_maths.jpg",
            path: "/books/pre_uni_maths"
        },
        {
            title: "Pre-University Physical Chemistry",
            image: "assets/phy/books/chemistry_16.jpg",
            path: "/books/chemistry_16"
        }
    ],
    []
);


export const BookModalBody = () => {
    const dispatch = useDispatch();

    return <Row className={"pb-2 justify-content-center"}>
        {isaacBooks.map((book: BookInfo) => <Col className="mb-3" lg={3} sm={6}>
            <Link className={"text-center w-100"} onClick={() => dispatch(closeActiveModal())} to={book.path}>
                <img className="ml-auto mr-auto book-cover-small" src={book.image} alt="" />
                <span>{book.title}</span>
            </Link>
        </Col>)}
    </Row>;
};

export const isaacBooksModal = () => ({
    closeAction: () => {store.dispatch(closeActiveModal())},
    title: "Isaac Skills Books",
    body: <BookModalBody/>
});
