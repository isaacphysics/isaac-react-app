import * as RS from "reactstrap";
import {Col, Row} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {STUDENTS_CRUMB, SUBJECTS} from "../../../services/constants";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";

export const PreUniMaths = () => {

    const pageHelp = <span>
        The Isaac Physics Mastering Essential Pre-University Physics book
    </span>;

    return <RS.Container className="maths">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb currentPageTitle="Pre-University Mathematics for Sciences" intermediateCrumbs={[STUDENTS_CRUMB]} help={pageHelp} />
                <img className="book-cover" src="/assets/phy/books/pre_uni_maths.jpg" alt="Cover of the book."/>
                <PageFragment fragmentId="phys_book_gcse_intro"/>
            </div>
            <Row/>
            <div className="book-levels">
                <h4>Chapters:</h4>
                <Row>
                    <Col md={6} className="p-2">
                        <BookChapter chapterId={'pre_uni_maths_lvl1_boards'} chapterTitle={'Level 1'} chapterIcon={'1'} chapterSubject={SUBJECTS.MATHS}/>
                    </Col>
                    <Col md={6} className="p-2">
                        <BookChapter chapterId={'pre_uni_maths_lvl2_boards'} chapterTitle={'Level 2'} chapterIcon={'2'} chapterSubject={SUBJECTS.MATHS}/>
                    </Col>
                </Row>
                <Row>
                    <Col md={6} className="p-2">
                        <BookChapter chapterId={'pre_uni_maths_lvl3_boards'} chapterTitle={'Level 3'} chapterIcon={'3'} chapterSubject={SUBJECTS.MATHS}/>
                    </Col>
                    <Col md={6} className="p-2">
                        <BookChapter chapterId={'pre_uni_maths_lvl4_boards'} chapterTitle={'Level 4'} chapterIcon={'4'} chapterSubject={SUBJECTS.MATHS}/>
                    </Col>
                </Row>
                <Row>
                    <Col md={6} className="p-2">
                        <BookChapter chapterId={'pre_uni_maths_lvl5_boards'} chapterTitle={'Level 5'} chapterIcon={'5'} chapterSubject={SUBJECTS.MATHS}/>
                    </Col>
                    <Col md={6} className="p-2">
                        <BookChapter chapterId={'pre_uni_maths_lvl6_boards'} chapterTitle={'Level 6'} chapterIcon={'6'} chapterSubject={SUBJECTS.MATHS}/>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col md={6} className="p-2">
                        <BookChapter chapterId={'pre_uni_maths_lvl7_boards'} chapterTitle={'Level 7'} chapterIcon={'7'} chapterSubject={SUBJECTS.MATHS}/>
                    </Col>
                </Row>
            </div>
        </Col>
    </RS.Container>
};