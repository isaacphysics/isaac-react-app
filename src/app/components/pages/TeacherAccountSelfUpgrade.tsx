import React, {useState} from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {PageFragment} from "../elements/PageFragment";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    selectors,
    useAppSelector,
    useRequestEmailVerificationMutation,
    useUpgradeToTeacherAccountMutation
} from "../../state";


export const TeacherAccountSelfUpgrade = () => {
    const [upgradeToTeacherAccount] = useUpgradeToTeacherAccountMutation();
    const user = useAppSelector(selectors.user.orNull);
    const [emailVerified] = useState(user?.loggedIn && (user.emailVerificationStatus === "VERIFIED"));
    const [sendVerificationEmail] = useRequestEmailVerificationMutation();
    const requestVerificationEmail = () => {
        if (user?.loggedIn && user.email) {
            sendVerificationEmail({email: user.email});
        }
    };

    return <Container>
        <Row>
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"Upgrade to a teacher account"}/>
            </Col>
        </Row>
        <Row>
            <Col className="pt-4 pb-5">
                <PageFragment fragmentId={"teacher_account_self_upgrade"}></PageFragment>
                <Button className="my-3" disabled={!emailVerified} onClick={upgradeToTeacherAccount}>Get a teacher account</Button>
                {!emailVerified && <small className="text-danger d-block">Your email address is not verified — please click on the link in the verification email to confirm your email address. You can <Button color="link primary-font-link" onClick={requestVerificationEmail}>request a new verification email</Button> if necessary.</small>}
            </Col>
        </Row>
    </Container>
}
