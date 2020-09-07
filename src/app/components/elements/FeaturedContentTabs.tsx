import React, {useEffect} from "react";
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

    return <div className="tabs-featured-question">
        <Tabs tabContentClass="mt-3 mt-md-5">
            {{
                "Featured question": <Row className="feattab-row">
                    <Col md={6} className="feattab-info pl-md-4">
                        <h2 className="h-question-mark mb-md-3">
                            <span>?</span>
                            <div className="mt-2 mt-md-0">
                                <IsaacContent doc={{
                                    "type": "content",
                                    "encoding": "markdown",
                                    "value": "An internet host has the IP address <code class='bg-transparent shadow-none'>192.168.100.4/17</code> — the address is written in CIDR form."
                                }}/>
                            </div>
                        </h2>
                    </Col>
                    <Col md={6}>
                    </Col>
                    <Col md={6}>
                        {/*TODO FEATURED_QUESTION_UPDATE uncomment TempExamBoardPicker if featured question needs it
                         <TempExamBoardPicker className="float-right pt-md-5 pr-md-5 pt-3 pr-3" hideLabel />*/}
                        <div className="mb-5">
                            <IsaacContent doc={{ /* Search for: TODO FEATURED_QUESTION_UPDATE  */
                                "value": "Tick all of the facts in the list below that can be determined by the specified address:",
                                "encoding": "markdown",
                                "type": "isaacItemQuestion",
                                "id": "net_internet_06|ba3863df-32e3-4bee-8587-eccc6eeb1b7a",
                                "items": [
                                    {
                                        "type": "item",
                                        "value": "The host has a non-routable IP address",
                                        "id": "52dc"
                                    },
                                    {
                                        "type": "item",
                                        "value": "The network (subnet) address is `192.168.100.0`",
                                        "id": "c3a8"
                                    },
                                    {
                                        "type": "item",
                                        "value": "The broadcast address is `192.168.255.255`",
                                        "id": "f064"
                                    },
                                    {
                                        "type": "item",
                                        "value": "The network (subnet) can support 32,768 hosts",
                                        "id": "631c"
                                    },
                                    {
                                        "type": "item",
                                        "value": "The subnet mask could be expressed as `255.255.128.0`",
                                        "id": "37ea"
                                    },
                                    {
                                        "type": "item",
                                        "value": "Host `192.168.120.4` is on the same network (subnet)",
                                        "id": "f315"
                                    }
                                ],
                                "hints": [
                                    {
                                        "type": "content",
                                        "children": [
                                            {
                                                "type": "content",
                                                "value": "**IP address:** Internet Protocol address — a 32-bit number (IPv4) assigned to each device that uses the Internet Protocol for communication.<br>\n**Subnet Mask:** a 32-bit number that masks an IP address so that the network and/or host address can be extracted.<br>\n**CIDR IP address:** IP address that ends with a slash followed by a number (the IP network prefix).",
                                                "encoding": "markdown"
                                            }
                                        ]
                                    },
                                    {
                                        "type": "content",
                                        "children": [
                                            {
                                                "type": "content",
                                                "value": "#### Goal\nIdentify what information is revealed by an IP address that uses the CIDR format.\n\n#### Information given\n* The internet host has the IP address `192.168.100.4/17`\n* The address is in CIDR format\n* The address reveals at least one fact\n\n#### Knowledge assumed\n* [How networks use the subnet mask](/concepts/net_internet_ip_addresses#how)",
                                                "encoding": "markdown"
                                            }
                                        ]
                                    }
                                ]
                            }}/>
                        </div>
                    </Col>

                    <Col md={{size: 5, offset: 1}} className="feattab-image text-center">
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
                        return <div className="computer-scientist-of-the-month mt-4 mb-5">
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
