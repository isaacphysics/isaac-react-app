import React, {useState} from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {PageFragment} from "../elements/PageFragment";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    mutationSucceeded,
    requestCurrentUser,
    selectors,
    useAppDispatch,
    useAppSelector,
    useRequestEmailVerificationMutation,
    useUpgradeToTeacherAccountMutation
} from "../../state";
import { useNavigate } from "react-router";
import { scheduleTeacherOnboardingModalForNextOverviewVisit } from "../elements/modals/AdaTeacherOnboardingModal";


export const TeacherAccountSelfUpgrade = () => {
    const [upgradeToTeacherAccount] = useUpgradeToTeacherAccountMutation();
    const user = useAppSelector(selectors.user.orNull);
    const [emailVerified] = useState(user?.loggedIn && (user.emailVerificationStatus === "VERIFIED"));
    const [sendVerificationEmail] = useRequestEmailVerificationMutation();

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    const requestVerificationEmail = () => {
        if (user?.loggedIn && user.email) {
            void sendVerificationEmail({email: user.email});
        }
    };

    const upgrade : React.MouseEventHandler<HTMLButtonElement> = async (event) => {
        const response = await upgradeToTeacherAccount(event);

        if (mutationSucceeded(response)) {
            await dispatch(requestCurrentUser()); // Refresh user details locally
            scheduleTeacherOnboardingModalForNextOverviewVisit();
            void navigate("/dashboard");
        }
    };

    return <Container>
        <Row>
            <Col>
                <TitleAndBreadcrumb currentPageTitle={"Upgrade to a teacher account"}/>
            </Col>
        </Row>
        <Row>
            <Col className="pt-4 pb-7">
                <PageFragment fragmentId={"teacher_account_self_upgrade"}></PageFragment>
                <Button className="my-3" disabled={!emailVerified} onClick={upgrade}>Get a teacher account</Button>
                {!emailVerified && <small className="text-danger d-block">Your email address is not verified — please click on the link in the verification email to confirm your email address. You can <Button color="link primary-font-link" onClick={requestVerificationEmail}>request a new verification email</Button> if necessary.</small>}
            </Col>
        </Row>
    </Container>;
};
