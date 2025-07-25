import { act } from "@testing-library/react";
import { expectH1, renderTestEnvironment, setUrl } from "../testUtils";
import { isAda } from "../../app/services";
import _ from "lodash";
import { SelectionState, Filters, setTestFilters } from "../../mocks/filters";

describe("Concepts", () => {
    if (isAda) {
        it('has no such page', () => {});
    } else {
        const renderConceptsPage = async () => {
            await act(async () => {
                renderTestEnvironment();
                setUrl({ pathname: '/concepts' });
            });
        };

        it('renders the concepts header', async () => {
            await renderConceptsPage();
            expectH1('Concepts');
        });

        describe('Filters: Parent reselection', () => {
            const { Selected, Partial, Deselected, Hidden } = SelectionState;
            const { Physics, Skills, Maths, Number } = Filters;
    
            it('reselects parent topic after unselecting subtopics', async () => {
                await renderConceptsPage();
                const toggleAssert = setTestFilters([Physics, Skills]);
                await toggleAssert([], [Deselected, Hidden]);
                await toggleAssert([Physics], [Selected, Deselected]);
                await toggleAssert([Skills], [Partial, Selected]);
                await toggleAssert([Skills], [Selected, Deselected]);
                await toggleAssert([Physics], [Deselected, Hidden]);
            });

            it('reselects parent topic after unselecting subtopics, multiple parents', async () => {
                await renderConceptsPage();
                const toggleAssert = setTestFilters([Physics, Skills, Maths, Number]);
                await toggleAssert([], [Deselected, Hidden, Deselected, Hidden]);
                await toggleAssert([Physics, Maths], [Selected, Deselected, Selected, Deselected]);
                await toggleAssert([Skills, Number], [Partial, Selected, Partial, Selected]);
                await toggleAssert([Skills, Number], [Selected, Deselected, Selected, Deselected]);
                await toggleAssert([Physics, Maths], [Deselected, Hidden, Deselected, Hidden]);
            });
        });
    }
});
