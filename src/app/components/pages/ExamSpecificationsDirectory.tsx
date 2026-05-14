import React from "react";
import {Button, Card, CardBody, CardFooter, CardText, CardTitle, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";
import {Link} from "react-router-dom";
import { useTranslation } from 'react-i18next'


export const ExamSpecificationsDirectory = () => {
    const { t } = useTranslation()
    return <Container className="mb-7">
        <TitleAndBreadcrumb currentPageTitle={"Exam specifications"}/>
        <MetaDescription description={t('discoverOurFreeALevelComputerScienceTopicsAndQuestions', 'Discover our free A level computer science topics and questions.')}/>
        <Row className={"justify-content-center d-flex flex-row card-deck row-cols-1 row-cols-md-2 row-cols-xl-4 my-3"}>
            <Col className={"my-3"}>
                <Card className={"cs-card-plain w-100"}>
                    <CardBody>
                        <CardTitle>
                            <h3>{t('adaCs2', 'Ada CS')}</h3>
                        </CardTitle>
                        <CardText>
                            <ul>
                                <li>{t('core', 'Core')}</li>
                                <li>{t('advanced', 'Advanced')}</li>
                            </ul>
                        </CardText>
                    </CardBody>
                    <CardFooter className={"border-top-0 pb-3"}>
                        <Button className="justify-content-end" color="keyline" tag={Link} to="/exam_specifications_ada">
                            {t('showMe', 'Show me')}
                        </Button>
                    </CardFooter>
                </Card>
            </Col>
            <Col className={"my-3"}>
                <Card className={"cs-card-plain w-100"}>
                    <CardBody>
                        <CardTitle>
                            <h3>{t('england', 'England')}</h3>
                        </CardTitle>
                        <CardText>
                            <ul>
                                <li>{t('gcse', 'GCSE')}</li>
                                <li>{t('aLevel', 'A Level')}</li>
                            </ul>
                        </CardText>
                    </CardBody>
                    <CardFooter className={"border-top-0 pb-3"}>
                        <Button className="justify-content-end" color="keyline" tag={Link}
                            to="/exam_specifications_england">
                            {t('showMe', 'Show me')}
                        </Button>
                    </CardFooter>
                </Card>
            </Col>
            <Col className={"my-3"}>
                <Card className={"cs-card-plain w-100"}>
                    <CardBody>
                        <CardTitle>
                            <h3>{t('scotland', 'Scotland')}</h3>
                        </CardTitle>
                        <CardText>
                            <ul>
                                <li>{t('national5', 'National 5')}</li>
                                <li>{t('higher', 'Higher')}</li>
                                <li>{t('advancedHigher', 'Advanced Higher')}</li>
                            </ul>
                        </CardText>
                    </CardBody>
                    <CardFooter className={"border-top-0 pb-3"}>
                        <Button color="keyline" tag={Link} to="/exam_specifications_scotland">
                            {t('showMe', 'Show me')}
                        </Button>
                    </CardFooter>
                </Card>
            </Col>
            <Col className={"my-3"}>
                <Card className={"cs-card-plain w-100"}>
                    <CardBody>
                        <CardTitle>
                            <h3>{t('wales', 'Wales')}</h3>
                        </CardTitle>
                        <CardText>
                            <ul>
                                <li>{t('gcse', 'GCSE')}</li>
                                <li>{t('aLevel', 'A Level')}</li>
                            </ul>
                        </CardText>
                    </CardBody>
                    <CardFooter className={"border-top-0 pb-3"}>
                        <Button color="keyline" tag={Link} to="/exam_specifications_wales">{t('showMe', 'Show me')}</Button>
                    </CardFooter>
                </Card>
            </Col>
        </Row>
    </Container>;
};
