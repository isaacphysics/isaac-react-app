import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {loadMyAssignments} from "../state/actions";

const stateToProps = ({assignments}: any) => ({assignments});
const dispatchToProps = {loadMyAssignments};

const MyAssignmentsPageComponent = ({assignments, loadMyAssignments}: any) => {
    useEffect(() => {loadMyAssignments();}, []);

    return <React.Fragment>
        <h1>My Assignments</h1>
        <hr />
        {assignments && assignments.map((assignment: any, index: number) =>
            <div key={index}>
                <Link to={`/gameboards#${assignment.gameboardId}`}>
                    <h3>{assignment.gameboard.title}</h3>
                    <p>Assigned: {new Date(assignment.creationDate).toDateString()}</p>
                    {assignment.dueDate && <p>Due: {new Date(assignment.dueDate).toDateString()}</p>}
                    <p>By: {assignment.assignerSummary.familyName}</p>
                </Link>
                <hr />
            </div>
        )}
    </React.Fragment>;
};

export const MyAssignmentsPage = connect(stateToProps, dispatchToProps)(MyAssignmentsPageComponent);
