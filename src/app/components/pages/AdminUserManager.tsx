import React from "react";
import {Container} from "reactstrap";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";
import {LoggedInUser} from "../../../IsaacAppTypes";

interface AdminUserMangerProps {
    user: LoggedInUser;
}

export const AdminUserManager = (props: AdminUserMangerProps) => {
    return <Container>
        <BreadcrumbTrail intermediateCrumbs={[{title: "Admin", to: "/admin"}]} currentPageTitle="User manager"/>
        <h1 className="h-title">User manager</h1>


    </Container>
};
