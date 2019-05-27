import {CardBody, Col, CustomInput, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import React from "react";
import {ValidationUser} from "../../../IsaacAppTypes";
import {validateDob, validateEmail} from "../../services/validation";

interface UserDetailsProps {
    myUser: ValidationUser;
    setMyUser: (user: any) => void;
    isEmailValid: boolean;
    setIsEmailValid: (isEmailValid: boolean) => void;
    isDobValid: boolean;
    setIsDobValid: (isDobValid: boolean) => void;
}

export const UserDetails = ({myUser, setMyUser, isEmailValid, setIsEmailValid, isDobValid, setIsDobValid}: UserDetailsProps) => {
    return <CardBody>
        <Row>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="first-name-input">First Name</Label>
                    <Input
                        id="first-name-input" type="text" name="givenName"
                        defaultValue={myUser.givenName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setMyUser(Object.assign(myUser, {givenName: e.target.value}))
                        }}
                        required
                    />
                </FormGroup>
            </Col>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="last-name-input">Last Name</Label>
                    <Input
                        id="last-name-input" type="text" name="last-name"
                        defaultValue={myUser.familyName}
                        onChange={(e:  React.ChangeEvent<HTMLInputElement>) => {
                            setMyUser(Object.assign(myUser, {familyName: e.target.value}))
                        }}
                        required
                    />
                </FormGroup>
            </Col>
        </Row>
        <Row>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="email-input">Email</Label>
                    <Input
                        invalid={!isEmailValid} id="email-input" type="email"
                        name="email" defaultValue={myUser.email}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const email = event.target.value;
                            setIsEmailValid(validateEmail(email));
                            setMyUser(Object.assign(myUser, {email}))
                        }}
                        aria-describedby="emailValidationMessage" required
                    />
                    <FormFeedback id="emailValidationMessage">
                        {(!isEmailValid) ? "Enter a valid email address" : null}
                    </FormFeedback>
                </FormGroup>
            </Col>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="dob-input">Date of Birth</Label>
                    <Input
                        invalid={!isDobValid}
                        id="dob-input"
                        type="date"
                        name="date-of-birth"
                        defaultValue={myUser.dateOfBirth}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const dateOfBirth = event.target.value;
                            setIsDobValid(validateDob(dateOfBirth));
                            setMyUser(Object.assign(myUser, {dateOfBirth: new Date(dateOfBirth)}))
                        }}
                        aria-describedby="ageValidationMessage"
                    />
                    {!isDobValid && <FormFeedback id="ageValidationMessage">
                        You must be over 13 years old
                    </FormFeedback>}
                </FormGroup>
            </Col>
        </Row>
        <Row>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="dob-input">Gender</Label>
                    <Row>
                        <Col size={6} lg={2}>
                            <CustomInput
                                id="gender-male" type="radio"
                                name="gender" label="Male"
                                defaultChecked={myUser.gender === 'MALE'}
                                onChange={
                                    (e: React.ChangeEvent<HTMLInputElement>) => {
                                        setMyUser(Object.assign(myUser, {gender: 'MALE'}))
                                    }
                                } required/>
                        </Col>
                        <Col size={6} lg={2}>
                            <CustomInput
                                id="gender-female" type="radio"
                                name="gender" label="Female"
                                defaultChecked={myUser.gender === 'FEMALE'}
                                onChange={
                                    (e: React.ChangeEvent<HTMLInputElement>) => {
                                        setMyUser(Object.assign(myUser, {gender: 'FEMALE'}))
                                    }
                                } required/>
                        </Col>
                        <Col size={6} lg={2}>
                            <CustomInput
                                id="gender-other" type="radio"
                                name="gender" label="Other"
                                defaultChecked={myUser.gender === 'OTHER'}
                                onChange={
                                    (e: React.ChangeEvent<HTMLInputElement>) => {
                                        setMyUser(Object.assign(myUser, {gender: 'OTHER'}))
                                    }
                                } required/>
                        </Col>
                    </Row>
                </FormGroup>
            </Col>
            <Col md={6}>
                <FormGroup>
                    <Label htmlFor="school-input">School</Label>
                    <Input
                        id="school-input" type="text" name="school"
                        defaultValue={myUser.schoolId}
                    />
                    {/* TODO lookup school */}
                </FormGroup>
            </Col>
        </Row>
        {/*<Row>*/}
        {/*    <Col md={6}>*/}
        {/*        <FormGroup>*/}
        {/*            <Label htmlFor="linked-accounts">Linked Accounts</Label>*/}
        {/*            <Row>Placeholder</Row> /!* TODO add linked account control *!/*/}
        {/*        </FormGroup>*/}
        {/*    </Col>*/}
        {/*</Row>*/}
    </CardBody>
};
