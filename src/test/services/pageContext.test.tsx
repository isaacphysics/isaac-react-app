import { isPhy, STAGE, determinePageContextFromPreviousPageContext } from "../../app/services";
import { UserContext, ContentBaseDTO } from "../../IsaacApiTypes";
import { PageContextState } from "../../IsaacAppTypes";
import { mockConceptPage } from "../../mocks/data";

describe("Page context derivation", () => {
    if (isPhy) {
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

        it("doesn't infer a stage if no registered context for a doc with multiple valid stages", () => {
            // Arrange
            const previousContext: PageContextState = {stage: [STAGE.GCSE]};
            const registered: UserContext[] = [{stage: STAGE.GCSE}];
            const page: ContentBaseDTO = {...mockConceptPage, audience: [{stage: [STAGE.A_LEVEL, STAGE.UNIVERSITY]}]};

            // Act
            const result = determinePageContextFromPreviousPageContext(registered, previousContext, page);

            // Assert
            expect(result?.stage).toBeUndefined();
        });

        it("doesn't infer a stage if no registered context for a doc with multiple valid stages", () => {
            // Arrange
            const previousContext: PageContextState = {stage: [STAGE.GCSE]};
            const registered: UserContext[] = [{stage: STAGE.GCSE}];
            const page: ContentBaseDTO = {...mockConceptPage, audience: [{stage: [STAGE.A_LEVEL, STAGE.UNIVERSITY]}]};

            // Act
            const result = determinePageContextFromPreviousPageContext(registered, previousContext, page);

            // Assert
            expect(result?.stage).toBeUndefined();
        });
    }
});