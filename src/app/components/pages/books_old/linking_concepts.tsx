import {Col, Row, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";
import { useTranslation } from "react-i18next";

export const LinkingConcepts = () => {
    const { t } = useTranslation();

    const pageHelp = <span>
        {t("sci:books.linkingConcepts.helpText")}
    </span>;

    return <Container className="physics">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-7" currentPageTitle={t("sci:books.linkingConcepts.title")} help={pageHelp} />
                <img className="book-cover" src="/assets/phy/books/linking_concepts.png" alt={t("sci:books.coverAltText")}/>
                <PageFragment fragmentId="phys_linking_concepts_intro"/>
            </div>
            <div className="book-levels">
                <Col>
                    <h4>{t("common:books.chaptersHeading")}</h4>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'linking_concepts_ch1_boards'} chapterTitle={t("sci:books.linkingConcepts.chapter1.title")} chapterSubHeading={t("sci:books.linkingConcepts.chapter1.subtitle")} chapterIcon={'1'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'linking_concepts_ch2_boards'} chapterTitle={t("sci:books.linkingConcepts.chapter2.title")} chapterSubHeading={t("sci:books.linkingConcepts.chapter2.subtitle")} chapterIcon={'2'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'linking_concepts_ch3_boards'} chapterTitle={t("sci:books.linkingConcepts.chapter3.title")} chapterSubHeading={t("sci:books.linkingConcepts.chapter3.subtitle")}  chapterIcon={'3'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'linking_concepts_ch4_boards'} chapterTitle={t("sci:books.linkingConcepts.chapter4.title")} chapterSubHeading={t("sci:books.linkingConcepts.chapter4.subtitle")}  chapterIcon={'4'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'linking_concepts_ch5_boards'} chapterTitle={t("sci:books.linkingConcepts.chapter5.title")} chapterSubHeading={t("sci:books.linkingConcepts.chapter5.subtitle")}  chapterIcon={'5'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'linking_concepts_ch6_boards'} chapterTitle={t("sci:books.linkingConcepts.chapter6.title")} chapterSubHeading={t("sci:books.linkingConcepts.chapter6.subtitle")}  chapterIcon={'6'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                </Col>
            </div>
        </Col>
    </Container>;
};
