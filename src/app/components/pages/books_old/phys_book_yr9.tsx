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
                <img className="book-cover" src="/assets/phy/books/phys_book_yr9.jpg" alt={t("common:books.coverAltText")}/>
                <PageFragment fragmentId="phys_book_yr9_intro"/>
            </div>
            <div className="book-levels">
                <Col>
                    <h4>{t("common:books.chaptersHeading")}</h4>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch1_boards'} chapterTitle={t("common:books.yr9.chapter1Title")} chapterSubHeading={t("common:books.yr9.chapter1Subheading")} chapterIcon={'1'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch2_boards'} chapterTitle={t("common:books.yr9.chapter2Title")} chapterSubHeading={t("common:books.yr9.chapter2Subheading")} chapterIcon={'2'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch3_boards'} chapterTitle={t("common:books.yr9.chapter3Title")} chapterSubHeading={t("common:books.yr9.chapter3Subheading")}  chapterIcon={'3'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch4_boards'} chapterTitle={t("common:books.yr9.chapter4Title")} chapterSubHeading={t("common:books.yr9.chapter4Subheading")}  chapterIcon={'4'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch5_boards'} chapterTitle={t("common:books.yr9.chapter5Title")} chapterSubHeading={t("common:books.yr9.chapter5Subheading")}  chapterIcon={'5'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'yr9_phys_ch6_boards'} chapterTitle={t("common:books.yr9.chapter6Title")} chapterSubHeading={t("common:books.yr9.chapter6Subheading")}  chapterIcon={'6'} chapterSubject={SUBJECTS.PHYSICS}/>
                        </Col>
                    </Row>
                </Col>
            </div>
        </Col>
    </Container>;
};
