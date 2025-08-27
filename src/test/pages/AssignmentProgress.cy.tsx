import React from "react";
import { mockUser } from "../../mocks/data";
import { AssignmentProgress } from "../../app/components/pages/AssignmentProgressWrapper";
import { PATHS } from "../../app/services";
import { TrackedRoute } from "../../app/components/navigation/TrackedRoute";

describe('Assignment progress', () => {
    it('Groups listing should have no visual regressions', () => {
        cy.mountWithStoreAndRouter(<AssignmentProgressWithRoute />, [PATHS.ASSIGNMENT_PROGRESS]);
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.matchImage();
    });

    it('Group overview (assignment view) should have no visual regressions', () => {
        cy.mountWithStoreAndRouter(<AssignmentProgressWithRoute />, [`${PATHS.ASSIGNMENT_PROGRESS}/group/2`]);
        cy.get('button').contains("Download assignments CSV").should('exist');
        cy.matchImage();
    });

    it('Group overview (test view) should have no visual regressions', () => {
        cy.mountWithStoreAndRouter(<AssignmentProgressWithRoute />, [`${PATHS.ASSIGNMENT_PROGRESS}/group/2`]);
        cy.get('button').contains("Tests").click();
        cy.matchImage();
    });

    // TODO: add mock data for progress details; add test on <ProgressDetails /> component
});

const AssignmentProgressWithRoute = () => <TrackedRoute exact path={[
    PATHS.ASSIGNMENT_PROGRESS,
    `${PATHS.ASSIGNMENT_PROGRESS}/:assignmentId`,
    `${PATHS.ASSIGNMENT_PROGRESS}/group/:groupId`,
    // @ts-ignore
]} component={() => <AssignmentProgress user={mockUser}/>} />;
