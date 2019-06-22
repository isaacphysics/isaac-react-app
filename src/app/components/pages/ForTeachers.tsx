import React from "react";
import {connect} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

const ForTeachersComponent = () => {
    return <RS.Container>
        <RS.Row>
            <RS.Col>
                <TitleAndBreadcrumb currentPageTitle="How we help teachers" breadcrumbTitleOverride="Teachers" />
            </RS.Col>
        </RS.Row>
        <RS.Row>
            <RS.Col className="pt-4 pb-5">
                This page is for teachers.
            </RS.Col>
        </RS.Row>
    </RS.Container>;
};

export const ForTeachers = connect()(ForTeachersComponent);
