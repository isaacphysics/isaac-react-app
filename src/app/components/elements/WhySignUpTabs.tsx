import React from "react";
import {Tabs} from "./Tabs";
import {Button} from "reactstrap";
import {Link} from "react-router-dom";

// FIXME ADA needs a complete rewrite by Ada content team
export const WhySignUpTabs = () => (
    <Tabs tabContentClass="pt-5">
        {{
            Teachers: <>
                <h3 className={"mb-4"}>Benefits for Teachers:</h3>
                <p>
                    Isaac Computer Science allows you to:
                </p>
                <ul>
                    <li>Select and set self-marking homework questions</li>
                    <li>Save time on marking</li>
                    <li>Pinpoint weak areas to work on with your students</li>
                    <li>Manage students’ progress in your personal markbook</li>
                </ul>

                <p>
                    Isaac Computer Science aims to provide:
                </p>
                <ul>
                    <li>Complete coverage of the leading exam specifications</li>
                    <li>High-quality materials written by experienced teachers</li>
                </ul>
                <p>
                    Everything on Isaac Computer Science is free, funded by the Department for Education.
                </p>
                <Button tag={Link} to="/teachers" color="secondary">Teacher Account Page</Button>
            </>,
            Students: <>
                <h3 className={"mb-4"}>Benefits for Students:</h3>
                <p>
                    Ada Computer Science allows you to:
                </p>
                <ul>
                    <li>Study and revise at your own pace</li>
                    <li>Track your progress as you answer questions</li>
                    <li>Work towards achieving better exam results</li>
                    <li>Access high-quality materials written by experienced teachers</li>
                    <li>Learn relevant content tailored to your exam board</li>
                </ul>
                <p>
                    Everything on Isaac Computer Science is free, funded by the Department for Education.
                </p>
                <Button tag={Link} to="/register" color="secondary">Sign Up</Button>
            </>
        }}
    </Tabs>
);
