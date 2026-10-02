import React from "react";
import {Button, Card, CardBody, CardFooter, CardText, CardTitle, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";
import {Link} from "react-router-dom";
import { useTranslation } from "react-i18next";


export const ExamSpecificationsDirectory = () => {
    const { t } = useTranslation();
    return <Container className="mb-7">
        <TitleAndBreadcrumb currentPageTitle={t("common:examSpecifications.directory.title")}/>
        <MetaDescription description={t("common:examSpecifications.directory.metaDescription")}/>
        <Row className={"justify-content-center d-flex flex-row card-deck row-cols-1 row-cols-md-2 row-cols-xl-4 my-3"}>
            <Col className={"my-3"}>
                <Card className={"cs-card-plain w-100"}>
                    <CardBody>
                        <CardTitle>
                            <h3>Ada CS</h3>
                        </CardTitle>
                        <CardText>
                            <ul>
                                <li>{t("common:examSpecifications.directory.ada.core")}</li>
                                <li>{t("common:examSpecifications.directory.ada.advanced")}</li>
                            </ul>
                        </CardText>
                    </CardBody>
                    <CardFooter className={"border-top-0 pb-3"}>
                        <Button className="justify-content-end" color="keyline" tag={Link} to="/exam_specifications_ada">
                            {t("common:examSpecifications.directory.showButton")}
                        </Button>
                    </CardFooter>
                </Card>
            </Col>
            <Col className={"my-3"}>
                <Card className={"cs-card-plain w-100"}>
                    <CardBody>
                        <CardTitle>
                            <h3>England</h3>
                        </CardTitle>
                        <CardText>
                            <ul>
                                <li>{t("common:examSpecifications.directory.england.gcses")}</li>
                                <li>{t("common:examSpecifications.directory.england.aLevel")}</li>
                            </ul>
                        </CardText>
                    </CardBody>
                    <CardFooter className={"border-top-0 pb-3"}>
                        <Button className="justify-content-end" color="keyline" tag={Link}
                            to="/exam_specifications_england">
                            {t("common:examSpecifications.directory.showButton")}
                        </Button>
                    </CardFooter>
                </Card>
            </Col>
            <Col className={"my-3"}>
                <Card className={"cs-card-plain w-100"}>
                    <CardBody>
                        <CardTitle>
                            <h3>Scotland</h3>
                        </CardTitle>
                        <CardText>
                            <ul>
                                <li>{t("common:examSpecifications.directory.scotland.national5")}</li>
                                <li>{t("common:examSpecifications.directory.scotland.higher")}</li>
                                <li>{t("common:examSpecifications.directory.scotland.advancedHigher")}</li>
                            </ul>
                        </CardText>
                    </CardBody>
                    <CardFooter className={"border-top-0 pb-3"}>
                        <Button color="keyline" tag={Link} to="/exam_specifications_scotland">
                            {t("common:examSpecifications.directory.showButton")}
                        </Button>
                    </CardFooter>
                </Card>
            </Col>
            <Col className={"my-3"}>
                <Card className={"cs-card-plain w-100"}>
                    <CardBody>
                        <CardTitle>
                            <h3>Wales</h3>
                        </CardTitle>
                        <CardText>
                            <ul>
                                <li>{t("common:examSpecifications.directory.wales.gcses")}</li>
                                <li>{t("common:examSpecifications.directory.wales.aLevel")}</li>
                            </ul>
                        </CardText>
                    </CardBody>
                    <CardFooter className={"border-top-0 pb-3"}>
                        <Button color="keyline" tag={Link} to="/exam_specifications_wales">{t("common:examSpecifications.directory.showButton")}</Button>
                    </CardFooter>
                </Card>
            </Col>
        </Row>
    </Container>;
};
