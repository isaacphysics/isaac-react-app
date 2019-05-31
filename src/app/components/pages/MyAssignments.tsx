import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {loadMyAssignments} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {AssignmentDTO} from "../../../IsaacApiTypes";
import {Container} from "reactstrap";

const stateToProps = (state: AppState) => (state && {assignments: state.assignments});
const dispatchToProps = {loadMyAssignments};

interface MyAssignmentsPageProps {
    assignments: AssignmentDTO[] | null;
    loadMyAssignments: () => void;
}
const MyAssignmentsPageComponent = ({assignments, loadMyAssignments}: MyAssignmentsPageProps) => {
    useEffect(() => {loadMyAssignments();}, []);

    return <Container>
        <h1>My Assignments</h1>
        <hr />
        <ShowLoading until={assignments}>
            {assignments && assignments.map((assignment, index) =>
                <div key={index}>
                    <Link to={`/gameboards#${assignment.gameboardId}`}>
                        <h3>{assignment.gameboard && assignment.gameboard.title}</h3>
                    </Link>
                    {assignment.creationDate &&
                        <p>Assigned: {new Date(assignment.creationDate).toDateString()}</p>
                    }
                    {assignment.dueDate &&
                        <p>Due: {new Date(assignment.dueDate).toDateString()}</p>
                    }
                    {assignment.assignerSummary &&
                        <p>By: {assignment.assignerSummary.familyName}</p>
                    }
                    <hr />
                </div>
            )}
        </ShowLoading>
    </Container>;
};

export const MyAssignments = connect(stateToProps, dispatchToProps)(MyAssignmentsPageComponent);
