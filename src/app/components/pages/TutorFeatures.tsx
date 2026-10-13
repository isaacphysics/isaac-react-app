import React from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useAppSelector, selectors} from "../../state";
import {isLoggedIn, isTutorOrAbove, PATHS} from "../../services";
import {Link} from "react-router-dom";
import { TeacherFeatureCard } from "./TeacherFeatures";
import { PageMetadata } from "../elements/PageMetadata";
import { useTranslation } from "react-i18next";

// A version of the "teacher features" page to showcase tutor account features
export const TutorFeatures = () => {
    const { t } = useTranslation();

    const user = useAppSelector(selectors.user.orNull);

    const isDisabled = !isLoggedIn(user) || !isTutorOrAbove(user);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={t("common:teacherFeatures.tutor.title")} icon={{type: "icon", icon: "icon-account"}}/>
        <PageMetadata noTitle>
            {isDisabled && <Button tag={Link} size="lg" color="keyline" to={isLoggedIn(user) ? "/tutor_account_request" : "/register"} className="float-end">
                {isLoggedIn(user) ? t("common:teacherFeatures.tutor.upgradeButton") : t("common:teacherFeatures.tutor.getButton")}
            </Button>}
            {t("common:teacherFeatures.tutor.description")}
        </PageMetadata>
        <Row className="my-4">
            <h2 className="h4">{t("common:teacherFeatures.tutor.workflowTitle")}</h2>
        </Row>
        <Row className="isaac-cards-body px-3 row-gap-4">
            <Col md={6} lg={4}>
                <TeacherFeatureCard
                    url = "/groups"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#groups"
                    title = {t("common:teacherFeatures.tutor.groupsTitle")}
                    subtitle = {t("common:teacherFeatures.tutor.groupsSubtitle")}
                    disabled = {isDisabled}
                />
            </Col>
            <Col md={6} lg={4}>
                <TeacherFeatureCard
                    url = {PATHS.SET_ASSIGNMENTS}
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#set-assignments"
                    title = {t("common:teacherFeatures.tutor.assignmentsTitle")}
                    subtitle = {t("common:teacherFeatures.tutor.assignmentsSubtitle")}
                    disabled = {isDisabled}
                />
            </Col>
            <Col md={{size: 6, offset: 3}} lg={{size: 4, offset: 0}}>
                <TeacherFeatureCard
                    url = {PATHS.ASSIGNMENT_PROGRESS}
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#track-progress"
                    title = {t("common:teacherFeatures.tutor.progressTitle")}
                    subtitle = {t("common:teacherFeatures.tutor.progressSubtitle")}
                    disabled = {isDisabled}
                />
            </Col>
        </Row>
        <Row className="my-4">
            <h2 className="h4">{t("common:teacherFeatures.tutor.resourcesTitle")}</h2>
        </Row>
        <Row className="isaac-cards-body mb-7 px-3 row-gap-4">
            <Col sm={6} md={4}>
                <TeacherFeatureCard               
                    url = "/support/tutor/general"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#teacher-forum"
                    title = {t("common:teacherFeatures.tutor.faqTitle")}
                    subtitle = {t("common:teacherFeatures.tutor.faqSubtitle")}
                />
            </Col>
            <Col sm={6} md={4}>
                <TeacherFeatureCard
                    url = "/pages/order_books"
                    imgSrc = "/assets/phy/icons/teacher_features_sprite.svg#skills-book-cover"
                    title = {t("common:teacherFeatures.tutor.booksTitle")}
                    subtitle = {t("common:teacherFeatures.tutor.booksSubtitle")}
                />
            </Col>
            <Col md={{size: 6, offset: 3}} lg={{size: 4, offset: 0}}>
                <TeacherFeatureCard
                    url = "/physics/a_level/question_decks"
                    imgSrc = "/assets/phy/icons/key_stage_sprite.svg#triple"
                    title = {t("common:teacherFeatures.tutor.decksTitle")}
                    subtitle = {t("common:teacherFeatures.tutor.decksSubtitle")}
                />
            </Col>
        </Row>
    </Container>;
};
