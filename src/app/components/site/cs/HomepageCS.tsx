import React, {useEffect} from "react";
import {selectors, useAppSelector} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Card, Col, Container, Row} from "reactstrap";
import {isLoggedIn, isTeacherOrAbove, SITE_TITLE, useDeviceSize} from "../../../services";
import {MetaDescription} from "../../elements/MetaDescription";
import { ImageBlock } from "../../elements/layout/ImageBlock";
import { IconCard } from "../../elements/cards/IconCard";
import { TextBlock } from "../../elements/layout/TextBlock";
import { ColumnSlice } from "../../elements/layout/ColumnSlice";
import { AdaNewsSection } from "../../elements/AdaNewsSection";
import classNames from "classnames";
import { Trans, useTranslation } from "react-i18next";

export const HomepageCS = () => {
    const { t } = useTranslation();
    useEffect( () => {document.title = SITE_TITLE;}, []);
    const user = useAppSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();

    return <>
        {/*<WarningBanner/>*/}
        <MetaDescription description={t("ada:homepage.metaDescription")}/>
        <div id="homepage">

            <section id="call-to-action" className="homepageHero">
                <Container id={"cta-container"} fluid>
                    <div className="d-flex flex-column align-items-center gap-5">
                        <div className={""}>
                            <h1 className={"backslash-left-small text-center font-size-2 font-size-md-2-5 mb-0"}>{t("ada:homepage.hero.title")}</h1>
                        </div>

                        <div className="logo-grid mx-3">
                            <a href="https://www.cam.ac.uk/" target="_blank" rel="noopener">
                                <img src="/assets/common/logos/university_of_cambridge.svg" alt={t("ada:homepage.hero.cambridgeAlt")} className='img-fluid footer-org-logo' data-site="uoc" />
                            </a>
                            <a href="https://www.raspberrypi.org/" target="_blank" rel="noopener">
                                <img src="/assets/common/logos/ada_rpf_icon.svg" alt={t("ada:homepage.hero.raspberryPiAlt")} className='img-fluid footer-org-logo' data-site="rpf" />
                            </a>
                            <span>{t("ada:homepage.hero.collaborationLabel")}</span>
                            <img src="/assets/common/logos/funded-by-uk-govt-white.svg" alt={t("ada:homepage.hero.ukGovAltText")} className='img-fluid' data-site="ukgovt" />
                            <img src="/assets/common/logos/techfirst-white.svg" alt={t("ada:homepage.hero.techFirstAltText")} className='img-fluid' data-site="techfirst" />
                        </div>
                        <div>
                            {isLoggedIn(user) && isTeacherOrAbove(user) &&
                                <Button color={"dark-primary"} tag={Link} to={"/dashboard"}>{t("ada:homepage.hero.dashboardButton")}</Button>}
                        </div>
                    </div>
                </Container>
            </section>
            <Container className={classNames({"position-absolute translate-middle-y": deviceSize !== "xs"})} fluid>
                <Card id={"cta-features-card"} className={"mw-1600 icon-card p-5"}>
                    <Row className={"justify-content-center gy-5 fw-bold"}>
                        <Col xs={12} md={6} lg={3} className={"cta-feature"}>
                            {t("ada:homepage.features.resources")}
                        </Col>
                        <Col xs={12} md={6} lg={3} className={"cta-feature"}>
                            {t("ada:homepage.features.feedback")}
                        </Col>
                        <Col xs={12} md={6} lg={3} className={"cta-feature"}>
                            {t("ada:homepage.features.markbook")}
                        </Col>
                        <Col xs={12} md={6} lg={3} className={"cta-feature"}>
                            {t("ada:homepage.features.examAlignment")}
                        </Col>
                    </Row>
                </Card>
            </Container>

            <section id="teach-and-learn">
                <Container className="homepage-padding mw-1600" fluid>
                    <div className="d-flex flex-column gap-5 align-items-center">
                        <h2 className={"font-size-1-75 font-size-md-2 text-center"}>{t("ada:homepage.teachLearn.title")}</h2>
                        <Card className={"icon-card w-100 p-5"}>
                            <ColumnSlice>
                                <TextBlock>
                                    <h3 className={"font-size-1-5 font-size-md-1-75"}>{t("ada:homepage.resources.title")}</h3>
                                    <ul>
                                        <li>{t("ada:homepage.resources.topics")}</li>
                                        <li>{t("ada:homepage.resources.conceptPages")}</li>
                                        <li>{t("ada:homepage.resources.collaboration")}</li>
                                        <li>{t("ada:homepage.resources.challenges")}</li>
                                    </ul>
                                </TextBlock>
                                <ImageBlock>
                                    <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4"src="/assets/cs/decor/concepts-slice.svg" alt=""/>
                                </ImageBlock>
                            </ColumnSlice>
                        </Card>
                        <Card className={"icon-card w-100 p-5"}>
                            <ColumnSlice>
                                <ImageBlock>
                                    <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4"src="/assets/cs/decor/markbook-slice.svg" alt=""/>
                                </ImageBlock>
                                <TextBlock>
                                    <h3 className={"font-size-1-5 font-size-md-1-75"}>{t("ada:homepage.tools.title")}</h3>
                                    <ul>
                                        <li>{t("ada:homepage.tools.selfMarking")}</li>
                                        <li>{t("ada:homepage.tools.questions")}</li>
                                        <li>{t("ada:homepage.tools.insights")}</li>
                                        <li>{t("ada:homepage.tools.studentProgress")}</li>
                                    </ul>
                                </TextBlock>
                            </ColumnSlice>
                        </Card>
                    </div>
                    <div className={"d-flex w-100 justify-content-center"}>
                        <div className={"d-flex flex-column flex-md-row gap-4 mt-7 align-items-center"}>
                            <Button tag={Link} to={"/teachers"}>
                                {t("ada:homepage.explore.teachersButton")}
                            </Button>
                            <Button tag={Link} to={"/students"}>
                                {t("ada:homepage.explore.studentsButton")}
                            </Button>
                        </div>
                    </div>
                </Container>
            </section>

            <section id="testimonial" className="bg-black">
                <Container className="homepage-padding mw-1600" fluid>
                    <ColumnSlice className={"align-items-start row-gap-4"}>
                        <TextBlock className="backslash-left text-white">
                            <h2 className={"font-size-1-75"}>
                                {t("ada:homepage.testimonials.teacherQuote")}
                            </h2>
                            <span>{t("ada:homepage.testimonials.teacherAttribution")}</span>
                        </TextBlock>
                        <TextBlock className="backslash-left text-white">
                            <h2 className={"font-size-1-75"}>
                                {t("ada:homepage.testimonials.studentQuote")}
                            </h2>
                            <span>{t("ada:homepage.testimonials.studentAttribution")}</span>
                        </TextBlock>
                    </ColumnSlice>
                </Container>
            </section>

            <section id="what-resources">
                <Container className={"homepage-padding mw-1600"}>
                    <TextBlock md={8}>
                        <h2 className={"font-size-1-75 mb-4"}>{t("ada:homepage.examBoards.title")}</h2>
                        <p className={"font-size-1-25"}>{t("ada:homepage.examBoards.description")}</p>
                    </TextBlock>
                    <ColumnSlice breakpoint="md">
                        <IconCard card={{
                            title: t("ada:homepage.examBoards.ukTitle"),
                            icon: {name: "icon-location-on", color: "secondary"},
                            clickUrl: "/exam_specifications",
                            buttonText: t("ada:homepage.examBoards.seeUkSpecifications"),
                            buttonStyle: "link",
                        }}>
                            <p>{t("ada:homepage.examBoards.ukDescription")}</p>
                            <ul>
                                <li><Trans i18nKey="ada:homepage.examBoards.ukEngland" components={{ b: <b /> }} /></li>
                                <li><Trans i18nKey="ada:homepage.examBoards.ukScotland" components={{ b: <b /> }} /></li>
                                <li><Trans i18nKey="ada:homepage.examBoards.ukWales" components={{ b: <b /> }} /></li>
                            </ul>
                        </IconCard>
                        <IconCard card={{
                            title: t("ada:homepage.examBoards.internationalTitle"),
                            icon: {name: "icon-globe", color: "secondary"},
                            clickUrl: "/exam_specifications_ada",
                            buttonText: t("ada:homepage.examBoards.seeCurriculum"),
                            buttonStyle: "link",
                        }}>
                            <p>{t("ada:homepage.examBoards.internationalDescription")}</p>
                            <ul>
                                <li><Trans i18nKey="ada:homepage.examBoards.internationalCore" components={{ b: <b /> }} /></li>
                                <li><Trans i18nKey="ada:homepage.examBoards.internationalAdvanced" components={{ b: <b /> }} /></li>
                            </ul>
                        </IconCard>
                    </ColumnSlice>
                </Container>
            </section>

            <section id="account">
                <Container className="homepage-padding mw-1600 position-relative" fluid>
                    <ColumnSlice>
                        <TextBlock>
                            <h2 className={"font-size-2"}>{t("ada:homepage.account.title")}</h2>
                            <div className={"font-size-1-25"}>
                                <p>{t("ada:homepage.account.noAccount")}</p>
                                <p>{t("ada:homepage.account.benefits")}</p>
                                <p>{t("ada:homepage.account.free")}</p>
                            </div>
                            <Button className={"mt-3"} color={"primary"} tag={Link} to={"/register"}>{t("ada:homepage.account.createButton")}</Button>
                        </TextBlock>
                        <ImageBlock>
                            <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/tools-slice.svg" alt=""/>
                        </ImageBlock>
                    </ColumnSlice>
                </Container>
            </section>

            <section id="news" className="bg-white">
                <Container className="homepage-padding mw-1600" fluid>
                    <AdaNewsSection isHomepage />
                </Container>
            </section>

            <section id="techfirst-home" className="bg-dark-pink-300">
                <Container className="homepage-padding mw-1600" fluid>
                    <ColumnSlice breakpoint="lg" reverseUnderBreakpoint>
                        <ImageBlock>
                            <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/cyber-explorers.svg" alt={t("ada:homepage.techfirst.cyberCityAltText")}/>
                        </ImageBlock>
                        <TextBlock className="text-white">
                            <h2 className={"font-size-2"}>{t("ada:homepage.techfirst.title")}</h2>
                            <p>{t("ada:homepage.techfirst.partnershipDescription")}</p>
                            <p>{t("ada:homepage.techfirst.contentDescription")}</p>
                            <div className="d-flex column-gap-3 flex-column flex-md-row">
                                <Button className={"mt-3"} color={"dark-primary"} tag={Link} to={"/techfirst"}>{t("ada:homepage.techfirst.readMoreButton")}</Button>
                                <Button className={"mt-3 bg-white"} color={"keyline"} tag={Link} to={"/topics#11-14"}>{t("ada:homepage.techfirst.exploreTopicsButton")}</Button>
                            </div>
                            <div className="d-flex gap-4 mt-4 mb-6 mt-lg-6 mb-lg-0">
                                <img src="/assets/common/logos/funded-by-uk-govt-white.svg" alt={t("ada:homepage.hero.ukGovAltText")} className='img-fluid' />
                                <img src="/assets/common/logos/techfirst-white.svg" alt={t("ada:homepage.hero.techFirstAltText")} className='img-fluid' />
                            </div>
                        </TextBlock>
                    </ColumnSlice>
                </Container>
            </section>
        </div>
    </>;
};
