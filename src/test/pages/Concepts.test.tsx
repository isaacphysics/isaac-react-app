import { expectH1, type PathString, renderTestEnvironment, SearchString, setUrl, waitForLoaded } from "../testUtils";
import { isAda } from "../../app/services";
import { PartialCheckboxState, SelectState, expectPartialCheckBox, expectSelect, Filter, toggleFilter } from "../../mocks/filters";
import { PageContextState } from "../../IsaacAppTypes";

describe("Concepts", () => {
    if (isAda) {
        it('has no such page', () => {});
    } else {
        const renderConceptsPage = async ({context, query}: {context?: NonNullable<PageContextState>, query?: SearchString} = {}) => {
            await renderTestEnvironment();
            await waitForLoaded();
            const url: PathString = context ? `/${context.subject}/${context.stage?.[0]}/concepts` : '/concepts';
            await setUrl(query ? { pathname: url, search: query } : {pathname: url});
            await waitForLoaded();
        };

        it('renders the concepts header', async () => {
            await renderConceptsPage();
            expectH1('Concepts');
        });

        describe('Filters', () => {
            const { Selected, Partial, Deselected, Hidden } = PartialCheckboxState;
            const { Physics, Skills, Maths, Number, Geometry, All } = Filter;
    
            // Phsysics -> Skills
            // Maths -> Number
            it('unchecked root filters and no children initially', async () => {
                await renderConceptsPage();
                expectPartialCheckBox([Physics, Skills, Maths, Number]).toBe([Deselected, Hidden, Deselected, Hidden]);
            });

            it('checks parents and shows children after selecting parents', async () => {
                await renderConceptsPage();
                await toggleFilter([Physics, Maths]);
                expectPartialCheckBox([Physics, Skills, Maths, Number]).toBe([Selected, Deselected, Selected, Deselected]);
            });

            it('partial-checks parents, and checks children after selecting children', async () => {
                await renderConceptsPage({query: "?types=physics,maths"});
                await toggleFilter([Skills, Number]);
                expectPartialCheckBox([Physics, Skills, Maths, Number]).toBe([Partial, Selected, Partial, Selected]);
            });

            it('checks parents after deselecting children', async () => {
                await renderConceptsPage({ query: "?types=skills,number"});
                await toggleFilter([Skills, Number]);
                expectPartialCheckBox([Physics, Skills, Maths, Number]).toBe([Selected, Deselected, Selected, Deselected]);
            });

            it('hides children after deselecting parents', async () => {
                await renderConceptsPage({ query: "?types=physics,maths"});
                await toggleFilter([Physics, Maths]);
                expectPartialCheckBox([Physics, Skills, Maths, Number]).toBe([Deselected, Hidden, Deselected, Hidden]);
            });

            describe("On a context-specific concept page", () => {
                const { Checked, NotChecked } = SelectState;
                
                // All
                // Number
                // Geometry
                it('initially selects "All"', async () => {
                    await renderConceptsPage({ context: {subject: "maths", stage: ["a_level"] }});
                    expectSelect([All, Number, Geometry]).toBe([Checked, NotChecked, NotChecked]);
                });

                it('deselects "All" when other filters are selected', async () => {
                    await renderConceptsPage({ context: {subject: "maths", stage: ["a_level"] }});
                    await toggleFilter([Number]);
                    expectSelect([All, Number, Geometry]).toBe([NotChecked, Checked, NotChecked]);
                });

                it('reselects "All" when all other filters are deselected', async () => {
                    await renderConceptsPage({
                        context: {subject: "maths", stage: ["a_level"] },
                        query: "?types=number,geometry"
                    });
                    await toggleFilter([Number, Geometry]);
                    expectSelect([All, Number, Geometry]).toBe([Checked, NotChecked, NotChecked]);
                });

                it('deselects other filters when "All" is selected', async () => {
                    await renderConceptsPage({
                        context: {subject: "maths", stage: ["a_level"] },
                        query: "?types=number,geometry"
                    });
                    await toggleFilter([All]);
                    expectSelect([All, Number, Geometry]).toBe([Checked, NotChecked, NotChecked]);
                });
            });
        });
    }
});
