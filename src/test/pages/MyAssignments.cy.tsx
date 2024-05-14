import React from "react";
import {MyAssignments} from "../../app/components/pages/MyAssignments";
import {mockUser} from "../../mocks/data";


it('My Assignments should render', () => {
    // @ts-ignore
    cy.mount(<MyAssignments user={mockUser} />);
});