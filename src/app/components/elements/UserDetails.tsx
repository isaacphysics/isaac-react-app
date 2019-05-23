import {CardBody, Col, CustomInput, Form, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import React, {useState} from "react";
import {ValidationUser} from "../../../IsaacAppTypes";

interface UserDetailsProps {
    myUser: ValidationUser;
    isValidEmail: boolean;
    isValidDob: boolean;
    setMyUser: (e: any) => void;
    validateAndSetEmail: (e: any) => void;
    validateAndSetDob: (e: any) => void;
}

export const UserDetails = ({myUser, isValidEmail, isValidDob, setMyUser, validateAndSetEmail, validateAndSetDob}: UserDetailsProps) => {
    return <CardBody>
        <Form name="userDetails">
            <Row>
                <Col size={12} md={6}>
                    <FormGroup>
                        <Label htmlFor="first-name-input">First Name</Label>
                        <Input
                            id="first-name-input" type="text" name="givenName"
                            defaultValue={myUser.givenName}
                            onChange={(e: any) => {
                                setMyUser(Object.assign(myUser, {givenName: e.target.value}))
                            }}
                            required
                        />
                    </FormGroup>
                </Col>
                <Col size={12} md={6}>
                    <FormGroup>
                        <Label htmlFor="last-name-input">Last Name</Label>
                        <Input
                            id="last-name-input" type="text" name="last-name"
                            defaultValue={myUser.familyName}
                            onChange={(e: any) => {
                                setMyUser(Object.assign(myUser, {familyName: e.target.value}))
                            }}
                            required
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col size={12} md={6}>
                    <FormGroup>
                        <Label htmlFor="email-input">Email</Label>
                        <Input
                            invalid={!isValidEmail} id="email-input" type="email"
                            name="email" defaultValue={myUser.email}
                            onChange={(e: any) => {
                                validateAndSetEmail(e);
                                (isValidEmail) ? setMyUser(Object.assign(myUser, {email: e.target.value})) : null
                            }}
                            aria-describedby="emailValidationMessage" required
                        />
                        <FormFeedback id="emailValidationMessage">
                            {(!isValidEmail) ? "Enter a valid email address" : null}
                        </FormFeedback>
                    </FormGroup>
                </Col>
                <Col size={12} md={6}>
                    <FormGroup>
                        <Label htmlFor="dob-input">Date of Birth</Label>
                        <Input
                            invalid={!isValidDob}
                            id="dob-input"
                            type="date"
                            name="date-of-birth"
                            defaultValue={myUser.dateOfBirth}
                            onChange={(event: any) => {
                                validateAndSetDob(event);
                            }}
                            aria-describedby="ageValidationMessage"
                        />
                        <FormFeedback id="ageValidationMessage">
                            {(!isValidDob) ? "You must be over 13 years old" : null}
                        </FormFeedback>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col size={12} md={6}>
                    <FormGroup>
                        <Label htmlFor="dob-input">Gender</Label>
                        <Row>
                            <Col size={6} lg={2}>
                                <CustomInput
                                    id="gender-male" type="radio"
                                    name="gender" label="Male"
                                    defaultChecked={!!(myUser.gender == 'MALE')}
                                    onChange={
                                        (e: any) => {
                                            setMyUser(Object.assign(myUser, {gender: 'MALE'}))
                                        }
                                    } required/>
                            </Col>
                            <Col size={6} lg={2}>
                                <CustomInput
                                    id="gender-female" type="radio"
                                    name="gender" label="Female"
                                    defaultChecked={!!(myUser.gender == 'FEMALE')}
                                    onChange={
                                        (e: any) => {
                                            setMyUser(Object.assign(myUser, {gender: 'FEMALE'}))
                                        }
                                    } required/>
                            </Col>
                            <Col size={6} lg={2}>
                                <CustomInput
                                    id="gender-other" type="radio"
                                    name="gender" label="Other"
                                    defaultChecked={!!(myUser.gender == 'OTHER')}
                                    onChange={
                                        (e: any) => {
                                            setMyUser(Object.assign(myUser, {gender: 'OTHER'}))
                                        }
                                    } required/>
                            </Col>
                        </Row>
                    </FormGroup>
                </Col>
                <Col size={12} md={6}>
                    <FormGroup>
                        <Label htmlFor="school-input">School</Label>
                        <Input
                            id="school-input" type="text" name="school"
                            defaultValue={myUser.schoolId} required
                        />
                        {/* TODO lookup school */}
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col size={12} md={6}>
                    <FormGroup>
                        <Label htmlFor="linked-accounts">Linked Accounts</Label>
                        <Row>Placeholder</Row> {/* TODO add linked account control */}
                    </FormGroup>
                </Col>
            </Row>
        </Form>
    </CardBody>
}
