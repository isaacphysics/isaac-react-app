import {Col, Container, Row} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {SUBJECTS} from "../../../services";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";
import { useTranslation } from "react-i18next";

export const PreUniMaths2e = () => {
    const { t } = useTranslation();

    const pageHelp = <span>
        {t("sci:books.preUniMaths2e.helpText")}
    </span>;

    return <Container className="maths">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-7" currentPageTitle={t("sci:books.preUniMaths2e.title")} 
                    help={pageHelp} 
                    // modalId="help_modal_maths_book"
                />
                <img className="book-cover" src="/assets/phy/books/pre_uni_maths_2e.jpg" alt={t("common:books.coverAltText")}/>
                <PageFragment fragmentId="pre_uni_maths_intro_2e"/>
            </div>
            <div className="book-levels">
                <Col>
                    <h4>{t("common:books.chaptersLabel")}</h4>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_2e_ch1_boards'} chapterTitle={t("sci:books.preUniMaths2e.chapter1Title")}
                                chapterSubHeading={t("sci:books.preUniMaths2e.chapter1Subheading")}
                                chapterIcon={'1'} chapterSubject={SUBJECTS.MATHS}
                            />
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_2e_ch2_boards'} chapterTitle={t("sci:books.preUniMaths2e.chapter2Title")}
                                chapterSubHeading={t("sci:books.preUniMaths2e.chapter2Subheading")}
                                chapterIcon={'2'} chapterSubject={SUBJECTS.MATHS}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_2e_ch3_boards'} chapterTitle={t("sci:books.preUniMaths2e.chapter3Title")}
                                chapterSubHeading={t("sci:books.preUniMaths2e.chapter3Subheading")}
                                chapterIcon={'3'} chapterSubject={SUBJECTS.MATHS}
                            />
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_2e_ch4_boards'} chapterTitle={t("sci:books.preUniMaths2e.chapter4Title")}
                                chapterSubHeading={t("sci:books.preUniMaths2e.chapter4Subheading")}
                                chapterIcon={'4'} chapterSubject={SUBJECTS.MATHS}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'pre_uni_maths_2e_ch5_boards'} chapterTitle={t("sci:books.preUniMaths2e.chapter5Title")}
                                chapterSubHeading={t("sci:books.preUniMaths2e.chapter5Subheading")}
                                chapterIcon={'5'} chapterSubject={SUBJECTS.MATHS}
                            />
                        </Col>
                    </Row>
                </Col>
            </div>
        </Col>
    </Container>;
};
