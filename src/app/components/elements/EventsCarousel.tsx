import React from "react";
import {Card, CardBody, CardDeck, CardImg, CardText, CardTitle} from "reactstrap";
import {Link} from "react-router-dom";

export const EventsCarousel = () => {
    return (
        <CardDeck>
            <Card className='card-event my-4 mx-2'>
                <div className='card-image text-center mt-3'>
                    <CardImg
                        className='m-auto rounded-circle'
                        top
                        src="/assets/event3.svg"
                        alt="Teacher event illustration"
                    />
                </div>
                <CardBody className="d-flex flex-column">
                    <CardTitle tag="h3">Discovery @ Cambridge University</CardTitle>
                    <CardText className="m-0 card-text01">
                        Inspiring the next generation of Computer Scientists
                    </CardText>
                    <CardText className="m-0 my-auto card-date-time">
                        <span className="d-block my-2">
                            <span className="font-weight-bold">When:</span> {" "} Mon 1 July 2019
                        </span>
                        <span className='d-block my-2'>
                            10:00 PM — 3:00 PM
                        </span>
                        <span className='d-block my-2'>
                            <span className="font-weight-bold">Location:</span> {" "} Computer Laboratory, Cambridge
                        </span>
                    </CardText>
                    <CardText>
                        <a href="https://www.eventbrite.com/e/discovery-cambridge-university-tickets-60573636377" target="_blank" rel="noopener noreferrer">
                            View Details
                            <span className='sr-only'> of the event: Teacher Workshop</span>
                        </a>
                    </CardText>
                </CardBody>
            </Card>
            <Card className='card-event my-4 mx-2'>
                <div className='card-image text-center mt-3'>
                    <CardImg
                        className='m-auto rounded-circle'
                        top
                        src="/assets/event1.svg"
                        alt="Teacher event illustration"
                    />
                </div>
                <CardBody className="d-flex flex-column">
                    <CardTitle tag="h3">Teacher CPD @ The Engine Shed</CardTitle>
                    <CardText className="m-0 card-text01">
                        A free CPD workshop for A-level teachers
                    </CardText>
                    <CardText className="m-0 my-auto card-date-time">
                        <span className="d-block my-2">
                            <span className="font-weight-bold">When:</span> {" "} Wed 3 July 2019
                        </span>
                        <span className='d-block my-2'>
                            9:30 AM — 3:00 PM
                        </span>
                        <span className='d-block my-2'>
                            <span className="font-weight-bold">Location:</span> {" "} The Engine Shed, Bristol
                        </span>
                    </CardText>
                    <CardText>
                        <a href="https://www.eventbrite.com/e/teacher-cpd-the-engine-shed-bristol-tickets-60919500867" target="_blank" rel="noopener noreferrer">
                            View Details
                            <span className='sr-only'> of the event: Teacher CPD in Bristol</span>
                        </a>
                    </CardText>
                </CardBody>
            </Card>
            <Card className='card-event my-4 mx-2'>
                <div className='card-image text-center mt-3'>
                    <CardImg
                        className='m-auto rounded-circle'
                        top
                        src="/assets/event1.svg"
                        alt="Teacher event illustration"
                    />
                </div>
                <CardBody className="d-flex flex-column">
                    <CardTitle tag="h3">Teacher CPD - OOP @ University&nbsp;of&nbsp;Southampton</CardTitle>
                    <CardText className="m-0 card-text01">
                        A free CPD workshop for A-level teachers
                    </CardText>
                    <CardText className="m-0 my-auto card-date-time">
                        <span className="d-block my-2">
                            <span className="font-weight-bold">When:</span> {" "} Mon 8 July 2019
                        </span>
                        <span className='d-block my-2'>
                            10:00 PM — 4:00 PM
                        </span>
                        <span className='d-block my-2'>
                            <span className="font-weight-bold">Location:</span> {" "} Computer Science Building, Southampton
                        </span>
                    </CardText>
                    <CardText>
                        <a href="https://www.eventbrite.com/e/teacher-cpd-object-oriented-programming-university-of-southampton-tickets-62039047461" target="_blank" rel="noopener noreferrer">
                            View Details
                            <span className='sr-only'> of the event: Teacher CPD on OOP</span>
                        </a>
                    </CardText>
                </CardBody>
            </Card>
        </CardDeck>
    )
};
