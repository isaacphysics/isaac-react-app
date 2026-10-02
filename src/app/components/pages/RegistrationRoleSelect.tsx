import React from "react";
import {Button, Card, CardBody, CardText, CardTitle, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {SITE_TITLE} from "../../services";
import { useNavigate } from "react-router";
import { Trans, useTranslation } from "react-i18next";


export const RegistrationRoleSelect = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const teacherSignUp = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/register/teacher/details");
    };

    const studentSignup = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/register/student/age");
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={t("common:auth.roleSelect.title", { siteTitle: SITE_TITLE })} className="mb-4" icon={{type: "icon", icon: "icon-account"}}/>
        <Card className="my-7">
            <CardBody>
                <h2>{t("common:auth.roleSelect.heading")}</h2>
                <p>{t("common:auth.roleSelect.description")}</p>
                <Row>
                    <Col xs={12} lg={6}>
                        <Card className="h-100">
                            <CardBody className="d-flex flex-column">
                                <CardTitle>
                                    <h3>{t("common:auth.roleSelect.student.title")}</h3>
                                </CardTitle>
                                <CardText>
                                    <p>{t("common:auth.roleSelect.student.intro")}</p>
                                    <ul>
                                        <li>{t("common:auth.roleSelect.student.featurePreferences")}</li>
                                        <li>{t("common:auth.roleSelect.student.featureProgress")}</li>
                                        <li>See all assignments set by your teacher(s)</li>
                                    </ul>
                                </CardText>
                                <Button block className="align-self-end mt-auto" onClick={studentSignup}>{t("common:auth.roleSelect.student.button")}</Button>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={12} lg={6}>
                        <Card className="h-100">
                            <CardBody className="d-flex flex-column">
                                <CardTitle>
                                    <h3>{t("common:auth.roleSelect.teacher.title")}</h3>
                                </CardTitle>
                                <CardText>
                                    <p>{t("common:auth.roleSelect.teacher.intro")}</p>
                                    <ul>
                                        <li>{t("common:auth.roleSelect.teacher.featureGroups")}</li>
                                        <li>{t("common:auth.roleSelect.teacher.featureQuizzes")}</li>
                                        <li>{t("common:auth.roleSelect.teacher.featureProgress")}</li>
                                    </ul>
                                    <p>
                                        {/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="common:auth.roleSelect.teacher.noAccessNote" components={{ learnMoreLink: <a href="/support/teacher/general" /> }} />{/* eslint-enable jsx-a11y/anchor-has-content */}
                                    </p>
                                </CardText>
                                <Button block className="align-self-end mt-auto" onClick={teacherSignUp}>{t("common:auth.roleSelect.teacher.button")}</Button>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>;
};
