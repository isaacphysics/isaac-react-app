import React from "react";
import {Tabs} from "./Tabs";
import {Col, Row, Button} from "reactstrap";
import {Link} from "react-router-dom";
import {IsaacContent} from "../content/IsaacContent";
import {TempExamBoardPicker} from "./inputs/TempExamBoardPicker";

export const FeaturedContentTabs = () => (
    <div className="tabs-featured-question">
        <Tabs tabTitleClass="mb-3 mb-md-4">
            {{
                "Featured question": <Row className="feattab-row">

                    <Col md={6} className="feattab-info pl-md-4">
                        <h2 className="h-question-mark mb-md-3">
                            <span>?</span>
                            <div className="mt-2 mt-md-0">
                                <IsaacContent doc={{
                                    "type": "content",
                                    "encoding": "markdown",
                                    "value": "Simplify this Boolean expression:\n\n$ \\or{\\or{\\or{\\bracketnot{\\not{(\\and{A}{B})}}}{A}}{B}}{C} $"
                                }} />
                            </div>
                        </h2>
                    </Col>
                    <Col md={6}>
                    </Col>
                    <Col md={6}>
                        <TempExamBoardPicker className="float-right pt-md-5 pr-md-5 pt-3 pr-3" hideLabel />
                        <div className="mb-5">
                            <IsaacContent doc={{
                                "id": "sys_bool_07|d69ed9d9-2d76-4019-8022-358490d0c75d",
                                "type": "isaacMultiChoiceQuestion",
                                "encoding": "markdown",
                                "children": [
                                    {
                                        "type": "content",
                                        "encoding": "markdown",
                                        "children": [],
                                        "value": "The expression simplifies to:",
                                        "published": false,
                                        "tags": []
                                    }
                                ],
                                "published": true,
                                "hints": [
                                    {
                                        "type": "content",
                                        "children": [
                                            {
                                                "type": "content",
                                                "encoding": "markdown",
                                                "children": [

                                                ],
                                                "value": "**Boolean algebra** \u2014 a formal notation for describing logical relations.\n\n**Boolean identity** \u2014 a rule which allows you to simplify expressions using Boolean algebra.",
                                                "published": false,
                                                "tags": [

                                                ]
                                            }
                                        ],
                                        "published": false,
                                        "tags": [

                                        ]
                                    },
                                    {
                                        "type": "content",
                                        "children": [
                                            {
                                                "type": "content",
                                                "encoding": "markdown",
                                                "children": [

                                                ],
                                                "value": "**Goal**\n\nSimplify the expression shown to one of the four options provided.\n\n**Information given**\n\n- A Boolean expression\n\n**Information assumed**\n\n- [Rules of Boolean algebra](concepts/sys_bool_boolean_laws)\n- [How to simplify Boolean expressions](concepts/sys_bool_simplifying_expressions)",
                                                "published": false,
                                                "tags": [

                                                ]
                                            }
                                        ],
                                        "published": false,
                                        "tags": [

                                        ]
                                    },
                                    {
                                        "type": "content",
                                        "children": [
                                            {
                                                "id": "sys_bool_07|d69ed9d9-2d76-4019-8022-358490d0c75d|sys_bool_07|d69ed9d9-2d76-4019-8022-358490d0c75d|aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj10bjlnUUpkMGdmSQ==",
                                                "type": "video",
                                                "encoding": "markdown",
                                                "children": [

                                                ],
                                                "value": "_Add video caption here_",
                                                "published": true,
                                                "src": "https://www.youtube.com/watch?v=tn9gQJd0gfI"
                                            }
                                        ],
                                        "published": false,
                                        "tags": [

                                        ]
                                    }
                                ],
                                "choices": [
                                    {
                                        "type": "choice",
                                        "encoding": "markdown",
                                        "children": [

                                        ],
                                        "value": "$\\or{(\\and{A}{B})}{C}$",
                                        "published": false
                                    },
                                    {
                                        "type": "choice",
                                        "encoding": "markdown",
                                        "children": [

                                        ],
                                        "value": "$\\false$",
                                        "published": false
                                    },
                                    {
                                        "type": "choice",
                                        "encoding": "markdown",
                                        "children": [

                                        ],
                                        "value": "$\\or{A}{\\or{B}{C}}$",
                                        "published": false
                                    },
                                    {
                                        "type": "choice",
                                        "encoding": "markdown",
                                        "children": [

                                        ],
                                        "value": "$\\not{C}$",
                                        "published": false
                                    }
                                ]
                            }} />
                        </div>
                    </Col>

                    <Col md={{size: 5, offset: 1}} className="feattab-image text-center" >
                        <img src="/assets/ics_spot.svg" className="img-fluid" alt="Student illustration"/>
                        <Button tag={Link} to="/topics" color="primary" outline className="mt-4 d-none d-md-inline-block">
                            Explore by topic
                        </Button>
                    </Col>
                </Row>
            }}
        </Tabs>
    </div>

);
