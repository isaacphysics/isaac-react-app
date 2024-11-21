import React from "react";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";

export const TeacherEmails = () => <Container>
    <TitleAndBreadcrumb currentPageTitle="Teacher Emails" />
    <div className="mt-4"/>
    <PageFragment fragmentId="teacher_emails"/>
</Container>;
