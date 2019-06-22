import React from "react";
import {connect} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";
import {AppState} from "../../state/reducers";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {isTeacher} from "../../services/user";
import {Link} from "react-router-dom";

const stateToProps = (state: AppState) => ({
    user: (state && state.user) || null
});

interface ForTeachersProps {
    user: LoggedInUser | null;
}

const ForTeachersComponent = ({user}: ForTeachersProps) => {
    const pageTitle = user && isTeacher(user) ? "My Isaac teaching" : "How we help teachers";

    const teacherUpgradeLink = <div className="text-muted mt-2">
        Are you a teacher? {" "}
        <a href="/pages/teacher_account_request" target="_blank" rel="noopener noreferrer">
            <span className='sr-only'> Are you a teacher? </span> Let us know
        </a> {" "}
        and we&apos;ll convert your account to a teacher account.
    </div>;
    const registrationButton = <div className="text-center">
        <RS.Button size="lg" tag={Link} to={"/register"} color="primary" outline>Sign up</RS.Button>
    </div>;

    return <RS.Container className="teachers-page">
        <RS.Row>
            <RS.Col>
                <TitleAndBreadcrumb currentPageTitle={pageTitle} breadcrumbTitleOverride="Teachers" />
            </RS.Col>
        </RS.Row>
        <RS.Row>
            <RS.Col md={{size: 8, offset: 2}} className="pt-4 pb-5">
                {user && isTeacher(user) ?
                    <div>Welcome back to Isaac Computer Science.</div> :
                    <PageFragment fragmentId="for_teachers_logged_out" />
                }
                {(user && user.loggedIn) ?
                    !isTeacher(user) && teacherUpgradeLink :
                    registrationButton
                }
            </RS.Col>
        </RS.Row>
        <RS.Row>
            <RS.Col>
                {user && user.loggedIn && <h2 className="h-secondary h-m">Pick up where you left off</h2>}
            </RS.Col>
        </RS.Row>
    </RS.Container>;
};

export const ForTeachers = connect(stateToProps)(ForTeachersComponent);
