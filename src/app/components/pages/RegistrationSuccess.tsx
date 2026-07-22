import React from "react";
import {Button, Card, CardBody, Container} from "reactstrap";
import {siteSpecific} from "../../services";
import { useNavigate } from "react-router";
import { Spacer } from "../elements/Spacer";
import { continueToAfterAuthPath, selectors, useAppSelector } from "../../state";


export const RegistrationSuccess = () => {
    const navigate = useNavigate();
    const user = useAppSelector(selectors.user.orNull);

    const continueToMyAccount = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/account");
    };

    return <Container>
        <Card className="my-7">
            <CardBody className="text-center">
                <div className="py-3 d-flex flex-column align-items-start px-5">
                    <h3>Account created!</h3>
                    <p>You&apos;re all set up. Welcome!</p>
                    <Spacer />
                    {siteSpecific(
                        <div className="rounded-4 w-100 mt-3 mb-7 login-flow-bg d-flex justify-content-center align-items-center">
                            <img className="img-fluid mx-auto w-sm-30 py-5" src="/assets/phy/decor/science-tick.svg" alt="" />,
                        </div>,
                        <img className="img-fluid mx-auto mt-3 mb-7 w-sm-50" src="/assets/cs/decor/verify_done.png" alt="" />
                    )}
                    <div className="d-flex w-100 gap-3 mx-3">
                        <Button color="solid" className="flex-grow-1" onClick={() => continueToAfterAuthPath(user)} aria-label="Continue to the site">Let&apos;s go!</Button>
                        <Button color="keyline" onClick={continueToMyAccount}>Check my account</Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    </Container>;
};
