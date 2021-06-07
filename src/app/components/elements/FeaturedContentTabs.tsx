import React, {useEffect, useRef} from "react";
import {Tabs} from "./Tabs";
import {Button, Col, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {IsaacContent} from "../content/IsaacContent";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {fetchFragment} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";

const COMPUTER_SCIENTIST_FRAGMENT_ID = "computer-scientist-of-the-month";

export function FeaturedContentTabs() {
    const dispatch = useDispatch();
    useEffect(() => {dispatch(fetchFragment(COMPUTER_SCIENTIST_FRAGMENT_ID));}, [dispatch]);
    const computerScientist = useSelector((state: AppState) => state?.fragments && state.fragments[COMPUTER_SCIENTIST_FRAGMENT_ID]);
    const tabOverride = useRef(1 + Math.floor(Math.random() * 2)); // useRef so that it does not change on re-render

    return <div className="tabs-featured-question">
        <Tabs tabContentClass="mt-3 mt-md-5" activeTabOverride={tabOverride.current}>
            {{
                "Featured question": <Row className="feattab-row">
                    <Col md={8} className="feattab-info pl-md-4">
                        <h2 className="h-question-mark">
                            <span>?</span>
                            {/*<div className="mt-2 mt-md-0">*/}
                            {/*    <IsaacContent doc={{*/}
                            {/*        "type": "content",*/}
                            {/*        "encoding": "markdown",*/}
                            {/*        "value": "An internet host has the IP address <code class='bg-transparent shadow-none'>192.168.100.4/17</code> — the address is written in CIDR form."*/}
                            {/*    }}/>*/}
                            {/*</div>*/}
                        </h2>
                    </Col>
                    <Col md={4}>
                    </Col>
                    <Col md={8}>
                        {/*TODO FEATURED_QUESTION_UPDATE uncomment TempExamBoardPicker if featured question needs it
                         <TempExamBoardPicker className="float-right pt-md-5 pr-md-5 pt-3 pr-3" hideLabel />*/}
                        <div className="mb-5 mt-md-n2"> {/* TODO FEATURED_QUESTION_UPDATE remove negative margin if there is an exposition */}
                            <IsaacContent doc={{ /* Search for: TODO FEATURED_QUESTION_UPDATE. Use the JSON from the API endpoint and not the Editor.  */
                                "id": "dsa_ctm_01|e1297595-c800-4f29-820f-5d69d471851c", /* FEATURED_QUESTION_UPDATE remember to add question ID to question part ID! */
                                "type": "isaacNumericQuestion",
                                "encoding": "markdown",
                                "children": [
                                    {
                                        "type": "content",
                                        "encoding": "markdown",
                                        "value": "Cleopatra has a problem. She wants to visit the Great Pyramid, but her maths teacher, Ptolemy, says she can only do this if she solves a logic puzzle. \n\nEvery block in the pyramid contains a number that is the sum of the two numbers below, e.g. G = K + L. Some of the numbers are missing. To help Cleopatra solve the puzzle, type the number that should be in block A below.",
                                    },
                                    {
                                        "id": "dsa_ctm_01|e1297595-c800-4f29-820f-5d69d471851c|dsa_ctm_01|e1297595-c800-4f29-820f-5d69d471851c|fig1",
                                        "type": "figure",
                                        "encoding": "markdown",
                                        "value": "Number pyramid",
                                        "src": "content/computer_science/theory_of_computation/computational_thinking/questions/figures/Isaac_Computer_Science_Computational_Methods_Diagrams_V2_Artboard%203.svg",
                                        "altText": "A pyramid of blocks. Some blocks have numbers and some numbers are missing. Each block's value is the sum of the two blocks below. "
                                    }
                                ],
                                "requireUnits": false,
                                "availableUnits": []
                            }} />
                        </div>
                    </Col>

                    <Col md={{size: 4, offset: 0}} className="feattab-image text-center">
                        <img src="/assets/ics_spot.svg" className="img-fluid" alt="Student illustration"/>
                        <Button tag={Link} to="/topics" color="primary" outline
                                className="mt-4 d-none d-md-inline-block">
                            Explore by topic
                        </Button>
                    </Col>
                </Row>,

                "Computer Science Journeys": <ShowLoading
                    until={computerScientist}
                    thenRender={(cserOfTheMonth) => {
                        return <div className="computer-scientist-of-the-month mt-4 mb-md-5">
                            <IsaacContent doc={cserOfTheMonth} />
                        </div>
                    }}
                    ifNotFound={<div className="computer-scientist-of-the-month mt-4 mb-5 text-center">
                        Unfortunately, we don't currently have a Computer Science Journey to display.<br />
                        Please check back later!
                    </div>}
                />
            }}
        </Tabs>
    </div>
}
