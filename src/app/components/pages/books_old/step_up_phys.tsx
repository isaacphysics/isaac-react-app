import {Col, Row, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";
import { useTranslation } from "react-i18next";

export const StepUpPhys = () => {
    const { t } = useTranslation();

    const pageHelp = <span>
        {t("sci:books.stepUpPhys.pageHelp")}
    </span>;

    return <Container className="physics">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-7" currentPageTitle={t("sci:books.stepUpPhys.title")} help={pageHelp} />
                <img className="book-cover" src="/assets/phy/books/step_up_phys.jpg" alt={t("sci:books.stepUpPhys.coverAltText")}/>
                <PageFragment fragmentId="phys_book_step_up_intro"/>
            </div>
            <div className="book-levels">
                <Col>
                    <h4>{t("sci:books.stepUpPhys.chaptersLabel")}</h4>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'step_up_ch1_boards'} chapterTitle={t("sci:books.stepUpPhys.chapter1Title")} chapterSubHeading={t("sci:books.stepUpPhys.chapter1SubHeading")} chapterIcon={'1'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'step_up_ch2_boards'} chapterTitle={t("sci:books.stepUpPhys.chapter2Title")} chapterSubHeading={t("sci:books.stepUpPhys.chapter2SubHeading")} chapterIcon={'2'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'step_up_ch3_boards'} chapterTitle={t("sci:books.stepUpPhys.chapter3Title")} chapterSubHeading={t("sci:books.stepUpPhys.chapter3SubHeading")}  chapterIcon={'3'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'step_up_ch4_boards'} chapterTitle={t("sci:books.stepUpPhys.chapter4Title")} chapterSubHeading={t("sci:books.stepUpPhys.chapter4SubHeading")}  chapterIcon={'4'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'step_up_ch5_boards'} chapterTitle={t("sci:books.stepUpPhys.chapter5Title")} chapterSubHeading={t("sci:books.stepUpPhys.chapter5SubHeading")}  chapterIcon={'5'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'step_up_ch6_boards'} chapterTitle={t("sci:books.stepUpPhys.chapter6Title")} chapterSubHeading={t("sci:books.stepUpPhys.chapter6SubHeading")}  chapterIcon={'6'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'step_up_ch7_boards'} chapterTitle={t("sci:books.stepUpPhys.chapter7Title")} chapterSubHeading={t("sci:books.stepUpPhys.chapter7SubHeading")}  chapterIcon={'7'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                </Col>
            </div>
        </Col>
    </Container>;
};
