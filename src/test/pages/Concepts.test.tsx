import { act } from "@testing-library/react";
import { expectH1, type PathString, renderTestEnvironment, setUrl } from "../testUtils";
import { isAda } from "../../app/services";
import { BoxSelectionState, CheckedState, expectCheckedStates, expectClasses, Filters, toggleFilters } from "../../mocks/filters";
import { PageContextState } from "../../IsaacAppTypes";

describe("Concepts", () => {
    if (isAda) {
        it('has no such page', () => {});
    } else {
        const renderConceptsPage = async ({context, query}: {context?: NonNullable<PageContextState>, query?: string} = {}) => {
            await act(async () => {
                renderTestEnvironment();
                const url: PathString = context ? `/${context.subject}/${context.stage?.[0]}/concepts` : '/concepts';
                setUrl({ pathname: url, search: query });
            });
        };

        it('renders the concepts header', async () => {
            await renderConceptsPage();
            expectH1('Concepts');
        });

        describe('Filters', () => {
            const { Selected, Partial, Deselected, Hidden } = BoxSelectionState;
            const { Physics, Skills, Maths, Number, Geometry, All } = Filters;
    
            // Phsysics -> Skills
            // Maths -> Number
            it('unchecked root filters and no children initially', async () => {
                await renderConceptsPage();
                expectClasses([Physics, Skills, Maths, Number], [Deselected, Hidden, Deselected, Hidden]);
            });

            it('checks parents and shows children after selecting parents', async () => {
                await renderConceptsPage();
                await toggleFilters([Physics, Maths]);
                expectClasses([Physics, Skills, Maths, Number], [Selected, Deselected, Selected, Deselected]);
            });

            it('partial-checks parents, and checks children after selecting children', async () => {
                await renderConceptsPage({query: "types=physics,maths"});
                await toggleFilters([Skills, Number]);
                expectClasses([Physics, Skills, Maths, Number], [Partial, Selected, Partial, Selected]);
            });

            it('checks parents after deselecting children', async () => {
                await renderConceptsPage({ query: "types=skills,number"});
                await toggleFilters([Skills, Number]);
                expectClasses([Physics, Skills, Maths, Number], [Selected, Deselected, Selected, Deselected]);
            });

            it('hides children after deselecting parents', async () => {
                await renderConceptsPage({ query: "types=physics,maths"});
                await toggleFilters([Physics, Maths]);
                expectClasses([Physics, Skills, Maths, Number], [Deselected, Hidden, Deselected, Hidden]);
            });

            describe("On a context-specific concept page", () => {
                const { Checked, Empty } = CheckedState;
                
                // All
                // Number
                // Geometry
                it('initially selects "All"', async () => {
                    await renderConceptsPage({ context: {subject: "maths", stage: ["a_level"] }});
                    expectCheckedStates([All, Number, Geometry], [Checked, Empty, Empty]);
                });

                it('deselects "All" when other filters are selected', async () => {
                    await renderConceptsPage({ context: {subject: "maths", stage: ["a_level"] }});
                    await toggleFilters([Number]);
                    expectCheckedStates([All, Number, Geometry], [Empty, Checked, Empty]);
                });

                it('reselects "All" when all other filters are deselected', async () => {
                    await renderConceptsPage({
                        context: {subject: "maths", stage: ["a_level"] },
                        query: "types=number,geometry"
                    });
                    await toggleFilters([Number, Geometry]);
                    expectCheckedStates([All, Number, Geometry], [Checked, Empty, Empty]);
                });

                it('deselects other filters when "All" is selected', async () => {
                    await renderConceptsPage({
                        context: {subject: "maths", stage: ["a_level"] },
                        query: "types=number,geometry"
                    });
                    await toggleFilters([All]);
                    expectCheckedStates([All, Number, Geometry], [Checked, Empty, Empty]);
                });
            });
        });
    }
});
