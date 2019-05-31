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
                        src="/assets/event1.svg"
                        alt="Teacher event illustration"
                    />
                </div>
                <CardBody className="d-flex flex-column">
                    <CardTitle tag="h3">Teacher Workshop</CardTitle>
                    <CardText className="m-0 card-text01">
                        Embedding isaaccomputerscience in your teaching
                    </CardText>
                    <CardText className="m-0 my-auto card-date-time">
                        <span className="d-block my-2">
                            <span className="font-weight-bold">When:</span> {" "} Wed 27 Mar 2019
                        </span>
                        <span className='d-block my-2'>
                            12:00 PM — 4:00 PM
                        </span>
                        <span className='d-block my-2'>
                            <span className="font-weight-bold">Location:</span> {" "} NUSTEM, Northumbria
                        </span>
                    </CardText>
                    <CardText>
                        <Link to="event/event1">
                            View Details
                            <span className='sr-only'> of the event: Teacher Workshop</span>
                        </Link>
                    </CardText>
                </CardBody>
            </Card>
            <Card className='card-event my-4 mx-2'>
                <div className='card-image text-center mt-3'>
                    <CardImg
                        className='m-auto rounded-circle'
                        top
                        src="/assets/event2.svg"
                        alt="Teacher event illustration"
                    />
                </div>
                <CardBody className="d-flex flex-column">
                    <CardTitle tag="h3">Teacher Workshop</CardTitle>
                    <CardText className="m-0 card-text01">
                        Embedding isaaccomputerscience in your teaching
                    </CardText>
                    <CardText className="m-0 my-auto card-date-time">
                        <span className="d-block my-2">
                            <span className="font-weight-bold">When:</span> {" "} Wed 27 Mar 2019
                        </span>
                        <span className='d-block my-2'>
                            12:00 PM — 4:00 PM
                        </span>
                        <span className='d-block my-2'>
                            <span className="font-weight-bold">Location:</span> {" "} NUSTEM, Northumbria
                        </span>
                    </CardText>
                    <CardText>
                        <Link to="event/event1">
                            View Details
                            <span className='sr-only'> of the event: Teacher Workshop</span>
                        </Link>
                    </CardText>
                </CardBody>
            </Card>
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
                    <CardTitle tag="h3">Teacher Workshop</CardTitle>
                    <CardText className="m-0 card-text01">
                        Embedding isaaccomputerscience in your teaching
                    </CardText>
                    <CardText className="m-0 my-auto card-date-time">
                        <span className="d-block my-2">
                            <span className="font-weight-bold">When:</span> {" "} Wed 27 Mar 2019
                        </span>
                        <span className='d-block my-2'>
                            12:00 PM — 4:00 PM
                        </span>
                        <span className='d-block my-2'>
                            <span className="font-weight-bold">Location:</span> {" "} NUSTEM, Northumbria
                        </span>
                    </CardText>
                    <CardText>
                        <Link to="event/event1">
                            View Details
                            <span className='sr-only'> of the event: Teacher Workshop</span>
                        </Link>
                    </CardText>
                </CardBody>
            </Card>
        </CardDeck>
    )
};
