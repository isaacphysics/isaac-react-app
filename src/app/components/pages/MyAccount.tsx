import React, {useState} from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {TabContent, TabPane, Nav, NavItem, NavLink, Button, Card, CardBody, CardTitle, CardText, CardFooter, Col, CustomInput, Form, FormGroup, Input, Row, Label, Table} from "reactstrap";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import classnames from 'classnames';



const stateToProps = (state: AppState) => ({user: state ? state.user : null});

const dispatchToProps = null;

interface AccountPageProps {user: RegisteredUserDTO | null}

const AccountPageComponent = ({user}: AccountPageProps) => {
    const updateDetails = () => console.log("Account updated"); // TODO BH account update action

    const [activeTab, setTab] = useState('1');

    return <div id="account-page">
        <h1>My Account</h1>
        {user &&
            <div>
                <Card>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === '1' })}
                                onClick={() => setTab('1')}
                            >
                                Profile
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === '2' })}
                                onClick={() => setTab('2')}
                            >
                                <span className="d-none d-lg-block d-md-block">Change Password</span>
                                <span className="d-block d-md-none">Password</span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === '3' })}
                                onClick={() => setTab('3')}
                            >
                                <span className="d-none d-lg-block d-md-block">Email Preferences</span>
                                <span className="d-block d-md-none">Email</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="1">
                                <CardBody>
                                    <Form name="userDetails" onSubmit={updateDetails}>
                                        <Row>
                                            <Col size={12} md={6}>
                                                <FormGroup>
                                                    <Label htmlFor="first-name-input">First Name</Label>
                                                    <Input id="first-name-input" type="text" name="first-name" defaultValue={user.givenName} required/>
                                                </FormGroup>
                                            </Col>
                                            <Col size={12} md={6}>
                                                <FormGroup>
                                                    <Label htmlFor="last-name-input">Last Name</Label>
                                                    <Input id="last-name-input" type="text" name="last-name" defaultValue={user.familyName} required/>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col size={12} md={6}>
                                                <FormGroup>
                                                    <Label htmlFor="email-input">Email</Label>
                                                    <Input id="email-input" type="email" name="email" defaultValue={user.email} required/>
                                                </FormGroup>
                                            </Col>
                                            <Col size={12} md={6}>
                                                <FormGroup>
                                                    <Label htmlFor="dob-input">Date of Birth</Label>
                                                    <Input
                                                        id="dob-input"
                                                        type="date"
                                                        name="date-of-birth"
                                                        defaultValue={user.dateOfBirth}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col size={12} md={6}>
                                                <FormGroup>
                                                    <Label htmlFor="dob-input">Gender</Label>
                                                    <Row>
                                                        <Col size={6} lg={2}>
                                                            <CustomInput id="gender-male" type="radio" name="gender" label="Male"
                                                                         defaultChecked={user.gender == 'MALE'} required/>
                                                        </Col>
                                                        <Col size={6} lg={2}>
                                                            <CustomInput id="gender-female" type="radio" name="gender" label="Female"
                                                                         defaultChecked={user.gender == 'FEMALE'} required/>
                                                        </Col>
                                                        <Col size={6} lg={2}>
                                                            <CustomInput id="gender-other" type="radio" name="gender" label="Other"
                                                                         defaultChecked={user.gender == 'OTHER'} required/>
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                            </Col>
                                            <Col size={12} md={6}>
                                                <FormGroup>
                                                    <Label htmlFor="school-input">School</Label>
                                                    <Input id="school-input" type="text" name="school" defaultValue={user.schoolId} required/>
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
                        </TabPane>
                        <TabPane tabId="2">
                                <CardBody>
                                    <Form name="userPassword" onSubmit={updateDetails}>
                                        <Row>
                                            <Col size={12} md={6}>
                                                <FormGroup>
                                                    <Label htmlFor="password-input">Password</Label>
                                                    <Input id="password" type="password" name="password" required/>
                                                </FormGroup>
                                            </Col>
                                            <Col size={12} md={6}>
                                                <FormGroup>
                                                    <Label htmlFor="password-confirm">Re-enter Password</Label>
                                                    <Input id="password-confirm" type="password" name="password" required/>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </Form>
                                </CardBody>
                        </TabPane>
                        <TabPane tabId="3">
                                <CardBody>
                                    <Form name="emailPreferences" onSubmit={updateDetails}>
                                        Tell us which emails you would like to receive. These settings can be changed at any time.
                                        <FormGroup>
                                            <Table>
                                                <thead>
                                                <tr>
                                                    <th>Email Type</th>
                                                    <th>Description</th>
                                                    <th>Preference</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                <tr>
                                                    <td>News and Updates</td>
                                                    <td>New content and website feature updates, as well as interesting news about Isaac.</td>
                                                    <td><CustomInput id="news" type="checkbox" name="news" defaultChecked={true}/></td>
                                                </tr>
                                                <tr>
                                                    <td>Assignments</td>
                                                    <td>Get notified when your teacher gives your group a new assignment.</td>
                                                    <td><CustomInput id="assignments" type="checkbox" name="assignments" defaultChecked={true}/></td>
                                                </tr>
                                                <tr>
                                                    <td>Events</td>
                                                    <td>Information about new virtual or real world physics events.</td>
                                                    <td><CustomInput id="events" type="checkbox" name="events" defaultChecked={true}/></td>
                                                </tr>
                                                </tbody>
                                            </Table>
                                        </FormGroup>
                                    </Form>
                                </CardBody>
                        </TabPane>
                    </TabContent>
                    <CardFooter>
                        <Row>
                            <Col size={12} md={{size: 6, offset: 3}}>
                                <Button color="primary" block href={'/'}>Save</Button>
                            </Col>
                        </Row>
                    </CardFooter>
                </Card>
            </div>
        }
    </div>;
};

export const MyAccount = connect(stateToProps, dispatchToProps)(AccountPageComponent);
