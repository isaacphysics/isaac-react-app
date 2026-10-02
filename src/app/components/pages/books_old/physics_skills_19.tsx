import {Col, Row, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {PageFragment} from "../../elements/PageFragment";
import {BookChapter} from "../../elements/BookChapter";
import { useTranslation } from "react-i18next";

export const PhysicsSkills19 = () => {
    const { t } = useTranslation();

    const pageHelp = <span>
        {t("sci:books.physicsSkills19.helpText")}
    </span>;

    return <Container>
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-7" currentPageTitle={t("sci:books.physicsSkills19.title")} help={pageHelp} /> {/* modalId="help_modal_physics_skills_19" /> */}
                <img className="book-cover" src="/assets/phy/books/physics_skills_19.jpg" alt={t("common:books.coverAltText")}/>
                <PageFragment fragmentId="physics_skills_19_intro"/>
            </div>
            <div className="book-levels">
                <Col>
                    <h4>{t("sci:books.physicsSkills19.asLevelHeading")}</h4>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'phys19_a_boards'} chapterTitle={t("sci:books.physicsSkills19.chapterGeneralQuestions")} chapterIcon={'A'}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'phys19_b_boards'} chapterTitle={t("sci:books.physicsSkills19.chapterMechanicsAs")} chapterIcon={'B'}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'phys19_c_boards'} chapterTitle={t("sci:books.physicsSkills19.chapterElectricCircuits")} chapterIcon={'C'}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'phys19_d_boards'} chapterTitle={t("sci:books.physicsSkills19.chapterWaves")} chapterIcon={'D'}/>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'phys19_e_boards'} chapterTitle={t("sci:books.physicsSkills19.chapterUncertainties")} chapterIcon={'E'}/>
                        </Col>
                    </Row>
                    <h4>{t("sci:books.physicsSkills19.a2LevelHeading")}</h4>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'phys19_f_boards'} chapterTitle={t("sci:books.physicsSkills19.chapterMechanicsA2")} chapterIcon={'F'}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'phys19_g_boards'} chapterTitle={t("sci:books.physicsSkills19.chapterGases")} chapterIcon={'G'}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'phys19_h_boards'} chapterTitle={t("sci:books.physicsSkills19.chapterFields")} chapterIcon={'H'}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'phys19_i_boards'} chapterTitle={t("sci:books.physicsSkills19.chapterCapacitors")} chapterIcon={'I'}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'phys19_j_boards'} chapterTitle={t("sci:books.physicsSkills19.chapterNuclearPhysics")} chapterIcon={'J'}/>
                        </Col>
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'phys19_k_boards'} chapterTitle={t("sci:books.physicsSkills19.chapterModellingUniverse")} chapterIcon={'K'}/>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6} className="p-2">
                            <BookChapter chapterId={'phys19_l_boards'} chapterTitle={t("sci:books.physicsSkills19.chapterFactSheets")} chapterIcon={'L'}/>
                        </Col>
                    </Row>
                </Col>
            </div>
        </Col>
    </Container>;
};
