import React from "react";
import { MetaDescription } from "../elements/MetaDescription";
import { Button, Card, CardBody, Container } from "reactstrap";
import { ColumnSlice } from "../elements/layout/ColumnSlice";
import { ImageBlock } from "../elements/layout/ImageBlock";
import { TextBlock } from "../elements/layout/TextBlock";
import { Link } from "react-router";
import { IconCard } from "../elements/cards/IconCard";
import { isLoggedIn } from "../../services";
import { selectors, useAppSelector } from "../../state";
import { Trans, useTranslation } from "react-i18next";

export const AdaCyberExplorersResources = () => {
    const { t } = useTranslation();
    const user = useAppSelector(selectors.user.orNull);

    return <>
        <MetaDescription description={t("pages:cyberExplorers.metaDescription")} />

        <section id="ada-11-14-header" className="bg-cyan-400">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice>
                    <TextBlock>
                        <h1 className="font-size-2-5 font-size-md-2-5 mb-3">
                            <Trans
                                i18nKey="pages:cyberExplorers.header.title"
                                components={{
                                    slash: <span className="text-pink" />,
                                    br: <br />,
                                }}
                            />
                        </h1>
                        <p className="font-size-1-25">{t("pages:cyberExplorers.header.description")}</p>
                        <p className="font-size-1-25">{t("pages:cyberExplorers.header.freeNote")}</p>
                        <Button outline className="bg-white" href="/topics#11-14">{t("pages:cyberExplorers.header.exploreButton")}</Button>
                    </TextBlock>
                    <ImageBlock>
                        <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/teacher-5.png" alt={t("pages:cyberExplorers.header.imageAlt")}/>
                    </ImageBlock>
                </ColumnSlice>
            </Container>
        </section>
        <div className="d-flex position-absolute mx-auto start-0 end-0 w-fit-content gap-4 py-4 px-5 bg-white rounded-4 translate-middle-y shadow-pink z-1">
            <img src="/assets/common/logos/funded_by_uk_govt_black.svg" alt={t("ada:label.fundedByUkGovernment")} className='img-fluid' />
            <img src="/assets/common/logos/techfirst_black.svg" alt={t("ada:label.techFirstLogo")} className='img-fluid' />
        </div>
        <section id="cyber-explorers">
            <Container className="homepage-padding mw-1600 d-flex flex-column align-items-center" fluid>
                <div className="text-center w-lg-75 mb-4 text-white">
                    <h2 className="font-size-2 mt-5">{t("pages:cyberExplorers.welcome.title")}</h2>
                    <p className="font-size-1-25 mt-3">{t("pages:cyberExplorers.welcome.description")}</p>
                </div>
                <ColumnSlice breakpoint="lg" reverseUnderBreakpoint className="row-gap-5">
                    <ImageBlock>
                        <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/cyber-explorers.svg" alt={t("ada:cyberExplorers.welcome.imageAlt")}/>
                    </ImageBlock>
                    <TextBlock>
                        <Card>
                            <CardBody className="py-5">
                                <div className="d-flex gap-3">
                                    <i className="icon icon-learning icon-md" color="secondary" />
                                    <div>
                                        <h3 className="font-size-1-25">{t("pages:cyberExplorers.welcome.familiarTitle")}</h3>
                                        <p>{t("pages:cyberExplorers.welcome.familiarText")}</p>
                                    </div>
                                </div>
                                <div className="d-flex gap-3">
                                    <i className="icon icon-search icon-md" color="secondary" />
                                    <div>
                                        <h3 className="font-size-1-25">{t("pages:cyberExplorers.welcome.exploreMoreTitle")}</h3>
                                        <p>{t("pages:cyberExplorers.welcome.exploreMoreText")}</p>
                                    </div>
                                </div>
                                <div className="d-flex gap-3">
                                    <i className="icon icon-group icon-md" color="secondary" />
                                    <div>
                                        <h3 className="font-size-1-25">{t("pages:cyberExplorers.welcome.teachingTitle")}</h3>
                                        <p className="mb-0">{t("pages:cyberExplorers.welcome.teachingText")}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </TextBlock>
                </ColumnSlice>
                <Button outline className="bg-white mt-5" href={"/pages/202609_techfirst"} target="_blank">{t("common:button.readMore")}</Button>
            </Container>
        </section>
        <section id="11-14-topics" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <div className="w-lg-75 mb-8">
                    <h2 className="font-size-2 mb-3">{t("pages:cyberExplorers.topics.title")}</h2>
                    <p className="font-size-1-25">{t("pages:cyberExplorers.topics.description")}</p>
                    <p className="font-size-1-25">{t("pages:cyberExplorers.topics.comingSoon")}</p>
                    <Button tag={Link} to="/topics#11-14" className="mt-3">{t("ada:button.exploreAllTopics")}</Button>
                </div>

                <Card className="bg-cyan-200">
                    <CardBody className="position-relative">
                        <img className="full-background-img" src="/assets/cs/decor/slice-bg-1.svg" alt=""/>
                        <h3 className="font-size-1-5 ms-3 my-3 d-flex gap-3 align-items-center">
                            {t("pages:cyberExplorers.topics.cyberSecurityTitle")}
                        </h3>
                        <div className="d-flex row row-cols-1 row-cols-sm-2 row-cols-lg-4 mt-3 w-100 g-0">
                            <IconCard className={"without-margin"} card={{
                                title: t("pages:cyberExplorers.topics.socialEngineering.title"),
                                icon: {name: "icon-hook", color: "secondary"},
                                bodyText: t("pages:cyberExplorers.topics.socialEngineering.body"),
                                clickUrl: "/concepts/social_engineering_11_14",
                                buttonText: t("pages:cyberExplorers.topics.exploreButton"),
                                includeTitleInAriaLabel: true,
                                buttonStyle: "link",
                            }}/>
                            <IconCard className={"without-margin"} card={{
                                title: t("pages:cyberExplorers.topics.cyberattacks.title"),
                                icon: {name: "icon-bug", color: "secondary"},
                                bodyText: t("pages:cyberExplorers.topics.cyberattacks.body"),
                                clickUrl: "/concepts/cyberattacks_11_14",
                                buttonText: t("pages:cyberExplorers.topics.exploreButton"),
                                includeTitleInAriaLabel: true,
                                buttonStyle: "link",
                            }}/>
                            <IconCard className={"without-margin"} card={{
                                title: t("pages:cyberExplorers.topics.defendMalware.title"),
                                icon: {name: "icon-shield-lock", color: "secondary"},
                                bodyText: t("pages:cyberExplorers.topics.defendMalware.body"),
                                clickUrl: "/concepts/defend_malware_11_14",
                                buttonText: t("pages:cyberExplorers.topics.exploreButton"),
                                includeTitleInAriaLabel: true,
                                buttonStyle: "link",
                            }}/>
                            <IconCard className={"without-margin"} card={{
                                title: t("pages:cyberExplorers.topics.networkSecurity.title"),
                                icon: {name: "icon-globe-lock", color: "secondary"},
                                bodyText: t("pages:cyberExplorers.topics.networkSecurity.body"),
                                clickUrl: "/concepts/network_security_11_14",
                                buttonText: t("pages:cyberExplorers.topics.exploreButton"),
                                includeTitleInAriaLabel: true,
                                buttonStyle: "link",
                            }}/>
                        </div>
                    </CardBody>
                </Card>
            </Container>
        </section>
        <section id="what-is-ada" className="bg-cultured">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice breakpoint="lg" reverseUnderBreakpoint className="row-gap-5">
                    <ImageBlock>
                        <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/panels-pink.svg" alt=""/>
                    </ImageBlock>
                    <TextBlock>
                        <h2>{t("pages:cyberExplorers.about.title")}</h2>
                        <h3 className="font-size-1-25 mb-3">{t("pages:cyberExplorers.about.subtitle")}</h3>
                        <ul>
                            <li>{t("pages:cyberExplorers.about.freeResources")}</li>
                            <li>{t("pages:cyberExplorers.about.classroomTools")}</li>
                            <li>{t("pages:cyberExplorers.about.expertContent")}</li>
                        </ul>
                        <div className="d-flex flex-column flex-md-row gap-3">
                            <Button href="/">{t("pages:cyberExplorers.about.discoverButton")}</Button>
                            {!isLoggedIn(user) && <Button outline className="bg-white" href="/register">{t("common:button.createAccount")}</Button>}
                        </div>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="regional-partners" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice breakpoint="lg" reverseUnderBreakpoint className="row-gap-5">
                    <TextBlock>
                        <h2>{t("pages:cyberExplorers.partners.title")}</h2>
                        <p>
                            {t("pages:cyberExplorers.partners.description")}
                        </p>
                        <p>
                            {t("pages:cyberExplorers.partners.recognition")}
                        </p>
                        {/* <Button outline className="bg-white" href="/pages/techfirst_rdps" target="_blank">Find out more</Button> */}
                    </TextBlock>
                    <ImageBlock>
                        <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/regional-partners.png" alt={t("pages:cyberExplorers.partners.imageAlt")}/>
                    </ImageBlock>
                </ColumnSlice>
            </Container>
        </section>
    </>;
};
