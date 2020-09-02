import {Col, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {PageFragment} from "../../elements/PageFragment";

export const Workbook20OCR = () => {

    const pageHelp = <span>
        The Isaac Computer Science OCR Workbook
    </span>;

    return <Container>
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-5" currentPageTitle="OCR Workbook" help={pageHelp} />
                <img className="book-cover" src="/assets/books/workbook_20_ocr.png" alt="Cover of the book."/>
                <PageFragment fragmentId="workbook_20_ocr_intro"/>
            </div>
        </Col>
    </Container>
};
