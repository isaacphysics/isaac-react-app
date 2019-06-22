import React from "react";
import {connect} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";
import {AppState} from "../../state/reducers";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {Link} from "react-router-dom";

const stateToProps = (state: AppState) => ({
    user: (state && state.user) || null
});

interface ForStudentProps {
    user: LoggedInUser | null;
}

const ForStudentsComponent = ({user}: ForStudentProps) => {
    const pageTitle = user && user.loggedIn ? "My Isaac" : "How we help students";
    const registrationButton = <div className="text-center">
        <RS.Button size="lg" tag={Link} to={"/register"} color="primary" outline>Sign up</RS.Button>
    </div>;

    return <RS.Container>
        <RS.Row>
            <RS.Col>
                <TitleAndBreadcrumb currentPageTitle={pageTitle} breadcrumbTitleOverride="Students" />
            </RS.Col>
        </RS.Row>
        <RS.Row>
            <RS.Col md={{size: 8, offset: 2}} className="pt-4 pb-5">
                {user && user.loggedIn ?
                    <div>Welcome back to Isaac Computer Science.</div> :
                    <React.Fragment>
                        <PageFragment fragmentId="for_students_logged_out"/>
                        {registrationButton}
                    </React.Fragment>
                }
            </RS.Col>
        </RS.Row>
    </RS.Container>;
};

export const ForStudents = connect(stateToProps)(ForStudentsComponent);
