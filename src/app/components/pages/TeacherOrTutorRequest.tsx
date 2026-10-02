import React from 'react';
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Row
} from "reactstrap";
import {
    isTeacherOrAbove,
    isTutorOrAbove,
    SITE_TITLE,
    TEACHER_REQUEST_ROUTE
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Link} from "react-router-dom";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import { Trans, useTranslation } from "react-i18next";

export const TeacherOrTutorRequest = ({user}: {user: RegisteredUserDTO}) => {
    const { t } = useTranslation();
    return <Container id="contact-page" className="pb-7">
        <TitleAndBreadcrumb currentPageTitle={t("common:teacherFeatures.request.title")} icon={{type: "icon", icon: "icon-account"}}/>
        <div className="pt-4">
            <Row>
                <Col size={9}>
                    <Card>
                        {isTutorOrAbove(user) && <Row>
                            <Col className="text-center pt-3">
                                <span className="h3">
                                    {isTeacherOrAbove(user) ? t("common:teacherFeatures.request.alreadyTeacher") : t("common:teacherFeatures.request.alreadyTutor")}
                                </span>
                                <p className="mt-3">
                                   Go to the <Link to={isTeacherOrAbove(user) ? "/teachers" : "/tutor_features"}>{isTeacherOrAbove(user) ? "Teacher tools" : "Tutor features"} page</Link> to start using your
                                   new account features.
                                </p>
                            </Col>
                        </Row>}
                        <CardBody>
                            <p>
                               {t("common:teacherFeatures.request.upgradeIntro", { siteTitle: SITE_TITLE })}
                            </p>
                            <ul>
                                <li>{t("common:teacherFeatures.request.teacherRequirement")}</li>
                                <li>{t("common:teacherFeatures.request.tutorRequirement")}</li>
                            </ul>
                            <Row className={"my-4"}>
                                <Col className={"text-center"}>
                                    <Button tag={Link} to={TEACHER_REQUEST_ROUTE}>
                                       {t("common:teacherFeatures.request.teacherButton")}
                                    </Button>
                                </Col>
                                <Col className={"text-center"}>
                                    <Button tag={Link} to="/tutor_account_request">
                                       {t("common:teacherFeatures.request.tutorButton")}
                                    </Button>
                                </Col>
                            </Row>
                            <small className={"text-muted"}>
                               <Trans i18nKey="common:teacherFeatures.request.moreInfo" components={{ tutorLink: <Link to="/tutor_features" />, teacherLink: <Link to="/teacher_features" /> }} />
                            </small>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    </Container>;
};
