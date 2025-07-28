import { act } from "@testing-library/react";
import { expectH1, renderTestEnvironment, setUrl } from "../testUtils";
import { isAda } from "../../app/services";
import _ from "lodash";
import { BoxSelectionState, CheckedState, Filters, setTestFilters, setTestHighlights } from "../../mocks/filters";
import { PageContextState } from "../../IsaacAppTypes";

describe("Concepts", () => {
    if (isAda) {
        it('has no such page', () => {});
    } else {
        const renderConceptsPage = async ({context}: {context?: NonNullable<PageContextState>} = {}) => {
            await act(async () => {
                renderTestEnvironment();
                setUrl({ pathname: context ? `${context.subject}/${context.stage?.[0]}/concepts` : '/concepts' });
            });
        };

        it('renders the concepts header', async () => {
            await renderConceptsPage();
            expectH1('Concepts');
        });

        describe('Filters: Parent reselection', () => {
            const { Selected, Partial, Deselected, Hidden } = BoxSelectionState;
            const { Physics, Skills, Maths, Number, Geometry, All } = Filters;
    
            it('reselects parent topic after unselecting subtopics', async () => {
                await renderConceptsPage();
                // Physics -> Skills
                const toggleAssert = setTestFilters([Physics, Skills]);

                await toggleAssert([], [Deselected, Hidden]);
                await toggleAssert([Physics], [Selected, Deselected]);
                await toggleAssert([Skills], [Partial, Selected]);
                await toggleAssert([Skills], [Selected, Deselected]);
                await toggleAssert([Physics], [Deselected, Hidden]);
            });

            it('reselects parent topic after unselecting subtopics, multiple parents', async () => {
                await renderConceptsPage();
                // Physics -> Skills
                // Maths -> Number
                const toggleAssert = setTestFilters([Physics, Skills, Maths, Number]);

                await toggleAssert([], [Deselected, Hidden, Deselected, Hidden]);
                await toggleAssert([Physics, Maths], [Selected, Deselected, Selected, Deselected]);
                await toggleAssert([Skills, Number], [Partial, Selected, Partial, Selected]);
                await toggleAssert([Skills, Number], [Selected, Deselected, Selected, Deselected]);
                await toggleAssert([Physics, Maths], [Deselected, Hidden, Deselected, Hidden]);
            });

            describe("On a context-specific concept page", () => {
                const { Checked, Empty } = CheckedState;

                it('reselects all after all topics are unselected', async () => {
                    await renderConceptsPage({ context: {subject: "maths", stage: ["a_level"] }});
                    // All
                    // Number
                    // Geometry
                    const toggleAssert = setTestHighlights([All, Number, Geometry]);

                    // TODO: fix bug where "All" is initially deselected
                    // await toggleAssert([], [Checked, Empty, Empty]);
                    await toggleAssert([Number, Geometry], [Empty, Checked, Checked]);
                    await toggleAssert([Number, Geometry], [Checked, Empty, Empty]);
                });
            });
        });
    }
});
