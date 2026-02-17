import React, {useEffect, useState} from "react";
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    InputGroup,
    Label,
    Row
} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {extractTeacherName, isAda, KEY, persistence, SITE_TITLE, siteSpecific} from "../../services";
import {
    selectors,
    useAppDispatch,
    useAppSelector,
    useGetActiveAuthorisationsQuery,
    useLazyGetTokenOwnerQuery
} from "../../state";
import { authenticateWithTokenAfterPrompt } from "../elements/panels/TeacherConnections";
import { useNavigate } from "react-router";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { PageContainer } from "../elements/layout/PageContainer";

export const RegistrationTeacherConnect = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const navigate = useNavigate();

    const [getTokenOwner] = useLazyGetTokenOwnerQuery();
    const [authenticationToken, setAuthenticationToken] = useState<string | undefined>("");
    const [submissionAttempted, setSubmissionAttempted] = useState<boolean>(false);

    const {data: activeAuthorisations} = useGetActiveAuthorisationsQuery(user && user.loggedIn && user.id || undefined);

    const codeIsValid = authenticationToken && authenticationToken.length > 0;

    function submit(event: React.FormEvent<HTMLFormElement | HTMLButtonElement>) {
        if (event) {event.preventDefault(); event.stopPropagation();}
        setSubmissionAttempted(true);
        if (user && user.loggedIn && user.id && codeIsValid) {
            void authenticateWithTokenAfterPrompt(user.id, authenticationToken, dispatch, getTokenOwner);
        }
    }

    const continueToNext = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate(siteSpecific("/register/preferences", "/register/success"));
    };

    useEffect(() => {
        // If the AFTER_AUTH_PATH is a teacher connection URL, we'll deal with it here instead.
        const afterAuthPath = persistence.load(KEY.AFTER_AUTH_PATH);
        if (afterAuthPath && afterAuthPath.includes("authToken")) {
            setAuthenticationToken(afterAuthPath.split("?authToken=").at(-1)?.toUpperCase().replace(/ /g,''));
            persistence.remove(KEY.AFTER_AUTH_PATH);
        }
    }, []);


    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" icon={{type: "icon", icon: "icon-account"}}/>
        }
        sidebar={siteSpecific(
            <SignupSidebar activeTab={4}/>,
            undefined
        )}
    >
        <Card className={"my-7"}>
            <CardBody>
                <Form onSubmit={submit}>
                    <h3>Connect your account to your teacher</h3>
                    {siteSpecific(
                        <>
                            <p>If you&apos;ve been given a group code by your teachers, enter it below. This lets your teachers set you work and see your progress. <a href="/support/student/homework#join_group" target="_blank">Learn more</a>.</p>
                            <p>You can skip this. You don&apos;t need to join a group to use Isaac, and you can always do this later from the My Account page.</p>
                        </>,
                        <>
                            <p>This lets you see the work your teacher sets, and lets your teacher see your progress. You can join more than one group and you always have control over which groups you are in. <a href="/support/student/general">Learn more</a></p>
                            <p>You can always skip this now and connect to your teacher later.</p>
                        </>
                    )}
                    <Col xs={12} lg={6}>
                        <FormGroup className="form-group">
                            <Label className={"fw-bold"} htmlFor="connect-code-input">{"Teacher connection code"}</Label>
                            {isAda && <p className={"input-description"}>Enter the code given by your teacher to join a group</p>}
                            <InputGroup className={"separate-input-group mb-4 d-flex flex-row align-items-center"}>
                                <Input
                                    id="connect-code-input"
                                    type="text"
                                    name="connect-code"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthenticationToken(e.target.value)}
                                    invalid={submissionAttempted && !codeIsValid}
                                    aria-describedby="codeValidationMessage"
                                    value={authenticationToken}
                                />
                                <div className="input-group-append">
                                    <Button disabled={!codeIsValid} onClick={submit} color="keyline">
                                        Connect
                                    </Button>
                                </div>
                            </InputGroup>
                            <FormFeedback id="codeValidationMessage">
                                Please enter a valid code.
                            </FormFeedback>
                        </FormGroup>
                        {activeAuthorisations && activeAuthorisations.length > 0 &&
                            <div className="mb-3">
                                <h5>Connected teachers:</h5>
                                <ul>
                                    {activeAuthorisations.map((auth) => (
                                        <li key={auth.id}>{extractTeacherName(auth)} - ({auth.email})</li>
                                    ))}
                                </ul>
                            </div>
                        }
                    </Col>
                    <hr />
                    <Row className="justify-content-end">
                        {siteSpecific(
                            <>
                                <Col xs={6} md={4} lg={3}>
                                    <Button className="w-100 my-2 px-2" color="keyline" onClick={continueToNext}>Skip</Button>
                                </Col>
                                <Col xs={6} md={4} lg={3}>
                                    <Button className="w-100 my-2 px-2" color="solid" disabled={!activeAuthorisations?.length} onClick={continueToNext}>Continue</Button>
                                </Col>
                            </>, 
                            <>
                                <Col xs={6} md={4} lg={3}>
                                    <Button className="w-100 my-2 px-2" color="solid" onClick={continueToNext}>Continue</Button>
                                </Col>
                            </>
                        )}
                    </Row>
                </Form>
            </CardBody>
        </Card>
    </PageContainer>;
};
