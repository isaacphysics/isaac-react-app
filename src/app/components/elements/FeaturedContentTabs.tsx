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
                            <IsaacContent doc={{ /* Search for: TODO FEATURED_QUESTION_UPDATE  */
                                "encoding": "markdown",
                                "type": "isaacStringMatchQuestion",
                                "id": "dsa_datastruct_05|3b5e8bb3-f217-4bb6-b8ff-636d8ee35988", /* FEATURED_QUESTION_UPDATE remember to add question ID to question part ID! */
                                "children": [
                                    {
                                        "type": "content",
                                        "value": "The following diagram is an abstraction of a stack. The stack currently contains three items (names). The pointer to the top of the stack is shown in pink.",
                                        "encoding": "markdown"
                                    },
                                    {
                                        "type": "image",
                                        "value": "A stack",
                                        "encoding": "markdown",
                                        "src": "content/theory/data-structures-and-algorithms/data-structures/questions/figures/Isaac_Computer_Science_2_Data_Structures_Project_OUTLINE_V6_38.png",
                                        "altText": "A stack with three elements. At the bottom, in position 0, is Rosie; in position 1 is Millie; and at the top of the stack, in position 2, is Ciara. The pointer to the top of the stack is currently pointing to Ciara in position 2."
                                    },
                                    {
                                        "type": "content",
                                        "value": "The following operations are carried out in the order given: push Harry, pop, push Luna, peek, pop, pop.",
                                        "encoding": "markdown"
                                    },
                                    {
                                        "type": "content",
                                        "encoding": "markdown",
                                        "value": "a) To which position will the `top` pointer point after all the operations have been carried out?"
                                    }
                                ]
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

                "Computer Scientist of the month": <ShowLoading
                    until={computerScientist}
                    thenRender={(cserOfTheMonth) => {
                        return <div className="computer-scientist-of-the-month mt-4 mb-md-5">
                            <IsaacContent doc={cserOfTheMonth} />
                        </div>
                    }}
                    ifNotFound={<div className="computer-scientist-of-the-month mt-4 mb-5 text-center">
                        Unfortunately, we don't currently have a Computer Scientist of the month.<br />
                        Please check back later!
                    </div>}
                />
            }}
        </Tabs>
    </div>
}
