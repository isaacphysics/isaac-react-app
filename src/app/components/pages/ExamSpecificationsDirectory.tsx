import React from "react";
import {Button, Card, CardBody, CardFooter, CardText, CardTitle, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";
import {Link} from "react-router-dom";


export const ExamSpecificationsDirectory = () => {
    return <Container className="mb-5">
        <TitleAndBreadcrumb currentPageTitle={"Exam specifications"}/>
        <MetaDescription description="Discover our free A level computer science topics and questions."/>
        <Row className={"justify-content-center d-flex flex-row card-deck row-cols-1 row-cols-md-2 row-cols-xl-4 my-3"}>
            <Col className={"my-3"}>
                <Card className={"cs-card w-100"}>
                    <CardBody>
                        <CardTitle>
                            <h3>Ada CS</h3>
                        </CardTitle>
                        <CardText>
                            <ul>
                                <li>Core</li>
                                <li>Advanced</li>
                            </ul>
                        </CardText>
                    </CardBody>
                    <CardFooter className={"border-top-0 pb-3"}>
                        <Button className="justify-content-end" color='secondary' outline tag={Link} to="/exam_specifications_ada">
                            Show me
                        </Button>
                    </CardFooter>
                </Card>
            </Col>
            <Col className={"my-3"}>
                <Card className={"cs-card w-100"}>
                    <CardBody>
                        <CardTitle>
                            <h3>England</h3>
                        </CardTitle>
                        <CardText>
                            <ul>
                                <li>GCSE</li>
                                <li>A Level</li>
                            </ul>
                        </CardText>
                    </CardBody>
                    <CardFooter className={"border-top-0 pb-3"}>
                        <Button className="justify-content-end" color='secondary' outline tag={Link}
                            to="/exam_specifications_england">
                            Show me
                        </Button>
                    </CardFooter>
                </Card>
            </Col>
            <Col className={"my-3"}>
                <Card className={"cs-card w-100"}>
                    <CardBody>
                        <CardTitle>
                            <h3>Scotland</h3>
                        </CardTitle>
                        <CardText>
                            <ul>
                                <li>National 5</li>
                                <li>Higher</li>
                                <li>Advanced Higher</li>
                            </ul>
                        </CardText>
                    </CardBody>
                    <CardFooter className={"border-top-0 pb-3"}>
                        <Button color='secondary' outline tag={Link} to="/exam_specifications_scotland">
                            Show me
                        </Button>
                    </CardFooter>
                </Card>
            </Col>
            <Col className={"my-3"}>
                <Card className={"cs-card w-100"}>
                    <CardBody>
                        <CardTitle>
                            <h3>Wales</h3>
                        </CardTitle>
                        <CardText>
                            <ul>
                                <li>GCSE</li>
                                <li>A Level</li>
                            </ul>
                        </CardText>
                    </CardBody>
                    <CardFooter className={"border-top-0 pb-3"}>
                        <Button color='secondary' outline tag={Link} to="/exam_specifications_wales">Show me</Button>
                    </CardFooter>
                </Card>
            </Col>
        </Row>
    </Container>;
};