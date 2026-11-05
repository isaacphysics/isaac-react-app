import {Col, Row, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";
import { useTranslation } from "react-i18next";

export const PhysBookYrNine = () => {
    const { t } = useTranslation();

    const pageHelp = <span>
        {t("common:books.yr9.helpText")}
    </span>;

    return <Container className="physics">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-7" currentPageTitle={t("common:books.yr9.title")} help={pageHelp} />
                <img className="book-cover" src="/assets/phy/books/phys_book_yr9.jpg" alt={t("sci:label.bookCoverAltText")}/>
                <PageFragment fragmentId="phys_book_yr9_intro"/>
            </div>
            <div className="book-levels">
                <Col>
                    <div className="h4">{t("sci:books.chaptersHeading")}</div>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch1_boards'} chapterTitle={t("sci:books.chapters.forceAndMotion")} chapterSubHeading={t("sci:books.chapters.sections1To15")} chapterIcon={'1'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch2_boards'} chapterTitle={t("sci:books.chapters.electricity")} chapterSubHeading={t("sci:books.chapters.sections16To23")} chapterIcon={'2'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch3_boards'} chapterTitle={t("sci:books.chapters.energyAndBalance")} chapterSubHeading={t("sci:books.chapters.sections24To29")}  chapterIcon={'3'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch4_boards'} chapterTitle={t("sci:books.chapters.materialsAndForces")} chapterSubHeading={t("sci:books.chapters.sections30To34")}  chapterIcon={'4'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch5_boards'} chapterTitle={t("sci:books.chapters.calculationPractice")} chapterSubHeading={t("common:books.yr9.chapter5Subheading")}  chapterIcon={'5'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch6_boards'} chapterTitle={t("sci:books.chapters.extraQuestions")} chapterSubHeading={t("common:books.yr9.chapter6Subheading")}  chapterIcon={'6'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                </Col>
            </div>
        </Col>
    </Container>;
};
