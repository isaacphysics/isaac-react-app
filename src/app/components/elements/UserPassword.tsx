import {Button, CardBody, Col, Form, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import React from "react";
import {ValidationUser} from "../../../IsaacAppTypes";
import {UserAuthenticationSettingsDTO} from "../../../IsaacApiTypes";

interface UserPasswordProps {
    myUser: ValidationUser;
    setMyUser: (e: any) => void;
    isValidPassword: boolean;
    validatePassword: (e: any) => void;
    authSettings: UserAuthenticationSettingsDTO | null;
    setCurrentPassword: (e: any) => void;
    passwordResetRequest: boolean;
    resetPasswordIfValidEmail: (e: any) => void;
}

export const UserPassword = ({myUser, setMyUser, isValidPassword, validatePassword, authSettings, setCurrentPassword, passwordResetRequest, resetPasswordIfValidEmail}: UserPasswordProps) => {
    return <CardBody>
        {authSettings && authSettings.hasSegueAccount ?
            <div>
                <Col>
                    <Row>
                        <FormGroup>
                            <Label htmlFor="password-input">Current Password</Label>
                            <Input
                                id="password-current" type="password" name="password"
                                onChange={(e: any) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </FormGroup>
                    </Row>
                    <Row>
                        <FormGroup>
                            <Label htmlFor="password-input">New Password</Label>
                            <Input id="password" type="password" name="password" required/>
                        </FormGroup>
                    </Row>
                    <Row>
                        <FormGroup>
                            <Label htmlFor="password-confirm">Re-enter New Password</Label>
                            <Input
                                invalid={!isValidPassword} id="password-confirm"
                                type="password" name="password"
                                onChange={(e: any) => {
                                    validatePassword(e);
                                    (e.target.value == (document.getElementById("password") as HTMLInputElement).value) ?
                                        setMyUser(Object.assign(myUser, {password: e.target.value})) :
                                        null;
                                }} aria-describedby="passwordValidationMessage" required
                            />
                            <FormFeedback id="passwordValidationMessage">
                                {(!isValidPassword) ?
                                    "Password must be at least 6 characters long" :
                                    null}
                            </FormFeedback>
                        </FormGroup>
                    </Row>
                </Col>
            </div> :
            !passwordResetRequest ?
                <div className="text-center">
                    {authSettings && authSettings.linkedAccounts &&
                    <p>
                        You do not currently have a password set for this account; you
                        sign in using
                        {(authSettings.linkedAccounts).map((linked, index) => {
                            return <span key={index} className="text-capitalize">{linked.toLowerCase()}</span>;
                        })}.
                    </p>
                    }
                    <Button className="btn-secondary" onClick={resetPasswordIfValidEmail}>
                        Click here to add a password
                    </Button>
                </div> :
                <p>
                    <strong className="d-block">Your password reset request is being processed.</strong>
                    <strong className="d-block">Please check your inbox.</strong>
                </p>
        }
    </CardBody>
};
