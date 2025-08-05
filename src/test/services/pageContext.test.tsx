import { STAGE, SUBJECTS, determinePageContextFromPreviousPageContext, isPhy } from "../../app/services";
import { UserContext, ContentBaseDTO } from "../../IsaacApiTypes";
import { PageContextState } from "../../IsaacAppTypes";
import { mockConceptPage } from "../../mocks/data";

describe("Page context stage derivation", () => {
    it("maintains existing stage if possible", () => {
        // Arrange
        const previousContext: PageContextState = {stage: [STAGE.GCSE]};
        const registered: UserContext[] = [{stage: STAGE.A_LEVEL}];
        const page: ContentBaseDTO = {...mockConceptPage, audience: [{stage: [STAGE.GCSE, STAGE.A_LEVEL]}]};

        // Act
        const result = determinePageContextFromPreviousPageContext(registered, previousContext, page);

        // Assert
        expect(result?.stage).toEqual([STAGE.GCSE]);
    });

    it("selects unique stage overlap between page audience and registered contexts", () => {
        // Arrange
        const previousContext: PageContextState = {stage: [STAGE.GCSE]};
        const registered: UserContext[] = [{stage: STAGE.GCSE}, {stage: STAGE.A_LEVEL}];
        const page: ContentBaseDTO = {...mockConceptPage, audience: [{stage: [STAGE.A_LEVEL, STAGE.UNIVERSITY]}]};

        // Act
        const result = determinePageContextFromPreviousPageContext(registered, previousContext, page);

        // Assert
        expect(result?.stage).toEqual([STAGE.A_LEVEL]);
    });
    
    it("selects doc stage if there is only one", () => {
        // Arrange
        const previousContext: PageContextState = {stage: [STAGE.GCSE]};
        const registered: UserContext[] = [{stage: STAGE.GCSE}];
        const page: ContentBaseDTO = {...mockConceptPage, audience: [{stage: [STAGE.A_LEVEL]}]};

        // Act
        const result = determinePageContextFromPreviousPageContext(registered, previousContext, page);

        // Assert
        expect(result?.stage).toEqual([STAGE.A_LEVEL]);
    });

    it("doesn't infer a stage for anonymous users with no previous context", () => {
        // Arrange
        const previousContext: PageContextState = undefined;
        const registered: UserContext[] = [];
        const page: ContentBaseDTO = {...mockConceptPage, audience: [{stage: [STAGE.GCSE, STAGE.A_LEVEL]}]};

        // Act
        const result = determinePageContextFromPreviousPageContext(registered, previousContext, page);

        // Assert
        expect(result?.stage).toBeUndefined();
    });

    it("doesn't infer a stage if no matching registered context for doc with multiple valid stages", () => {
        // Arrange
        const previousContext: PageContextState = {stage: [STAGE.GCSE]};
        const registered: UserContext[] = [{stage: STAGE.GCSE}];
        const page: ContentBaseDTO = {...mockConceptPage, audience: [{stage: [STAGE.A_LEVEL, STAGE.UNIVERSITY]}]};

        // Act
        const result = determinePageContextFromPreviousPageContext(registered, previousContext, page);

        // Assert
        expect(result?.stage).toBeUndefined();
    });

    it("doesn't infer a stage if multiple matches between registered contexts and doc audience", () => {
        // Arrange
        const previousContext: PageContextState = {stage: [STAGE.GCSE]};
        const registered: UserContext[] = [{stage: STAGE.A_LEVEL}, {stage: STAGE.UNIVERSITY}];
        const page: ContentBaseDTO = {...mockConceptPage, audience: [{stage: [STAGE.UNIVERSITY, STAGE.A_LEVEL]}]};

        // Act
        const result = determinePageContextFromPreviousPageContext(registered, previousContext, page);

        // Assert
        expect(result?.stage).toBeUndefined();
    });
});

if (isPhy) {
    describe("Page context subject derivation", () => {
        it("maintains existing subject if possible", () => {
            // Arrange
            const previousContext: PageContextState = {subject: SUBJECTS.CHEMISTRY};
            const page: ContentBaseDTO = mockConceptPage; // phy & chem

            // Act
            const result = determinePageContextFromPreviousPageContext(undefined, previousContext, page);

            // Assert
            expect(result?.subject).toEqual(SUBJECTS.CHEMISTRY);
        });

        it("selects highest priority subject from doc tags if subject has changed", () => {
            // Arrange
            const previousContext: PageContextState = {subject: SUBJECTS.BIOLOGY};
            const page: ContentBaseDTO = mockConceptPage; // phy & chem

            // Act
            const result = determinePageContextFromPreviousPageContext(undefined, previousContext, page);

            // Assert
            expect(result?.subject).toEqual(SUBJECTS.PHYSICS);
        });

        it("doesn't infer a subject if doc has no subject tags", () => {
            // Arrange
            const previousContext: PageContextState = {subject: SUBJECTS.BIOLOGY};
            const page: ContentBaseDTO = {...mockConceptPage, tags: ["not_a_subject"]};

            // Act
            const result = determinePageContextFromPreviousPageContext(undefined, previousContext, page);

            // Assert
            expect(result?.subject).toBeUndefined();
        });
    });
}