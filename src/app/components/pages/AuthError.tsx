import React, { ReactNode } from "react";
import {Link} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { Container, Row, Col } from "reactstrap";
import { isPhy } from "../../services";
import { type fetchErrorFromParameters } from "../../state";

type State = { errorMessage?: string, provider?: string, providerErrors: ReturnType<typeof fetchErrorFromParameters>};

export const AuthError = ({location: {state}}: {location: {state?: State}}) => {
    return <Container role="region" aria-label="Authentication Error">
        <TitleAndBreadcrumb currentPageTitle="Authentication error" breadcrumbTitleOverride="Authentication error" icon={{type: "hex", icon: "icon-error"}}/>
        <Row className="pt-4">
            <Col md={{size: 8, offset: 2}}>
                <ErrorMessage state={state}/>
            </Col>
        </Row>
    </Container>;
};

const ErrorMessage = ({ state }: { state?: State }) => {
    if (isPhy && state?.errorMessage?.startsWith('You do not use')) {
        return <AccountNotLinked state={state}/>;
    } else if (isPhy && state?.provider === 'microsoft' && state?.providerErrors?.errorDescription?.startsWith('AADSTS65004')) {
        return <ConsentMissingMicrosoft/>;
    } else {
        return <GenericError state={state}/>;
    }
};

const GenericError = ({ state }: { state?: State }) => <>
    <h3>
        {state?.errorMessage || ""}
    </h3>
    <p>
        An error occurred while attempting to log in.
        <br />
        You may want to return to the <Link to="/"> home page</Link> and try again, {" "}
        check <Link to="/support/student/general#login_issues">this FAQ</Link>,
        or <ContactUs /> if this keeps happening.
    </p>
</>;

const AccountNotLinked  = ({ state }: { state?: State }) => {
    const [provider, differentProvider] =
        state?.provider === 'google' ? ["Google", "Microsoft"] : ["Microsoft", 'Google'];

    return <>
        <h3>You don&apos;t use this {provider} account to log in</h3>
        <p>
            We&apos;ve found an Isaac account with that email address, but it&apos;s not configured for signing in with
            this {provider} account. You either didn&apos;t configure sign-in with {provider}, or used a
            different {provider} account.  
        </p>
        <ul>
            <li>
                To get back to your account, try <Link to="/login" aria-label="Log in link">logging in</Link> using
                a different {provider} account, a {differentProvider} account, or a password. You can also reset
                your password on the log-in page.
            </li>
            <li>
                Once you&apos;ve regained access, you can set up this {provider} account for signing in to
                Isaac. <SSOLink>Learn how.</SSOLink>  
            </li>
        </ul>
        <p>If you need more help signing in, <ContactUs/>.</p>
    </>;
};

const ConsentMissingMicrosoft = () => <>
    <h3>We need your consent</h3>
    <p>
        If you&apos;d like to use your Microsoft account for signing in to Isaac, you need to let us read your name and 
        email address from your Microsoft account.
    </p>
    <p>
        If you&apos;re using a school account and you&apos;re the first person using Isaac from your school, your
        IT department may need to pre-approve Isaac before you can consent. <SSOLink>Read more about signing in with Microsoft.</SSOLink>
    </p>
    <p>If you need more help signing in, <ContactUs />.</p>
</>;

const SSOLink = ({ children }: { children: ReactNode}) =>
    <Link to="/pages/single_sign_on" aria-label="Link to Single Sign-On documentation">{children}</Link>;

const ContactUs = () => <Link to="/contact" aria-label="Link to contact form">contact us</Link>;