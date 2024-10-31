import {http, HttpResponse, HttpHandler} from "msw";
import {API_PATH, PATHS, siteSpecific} from "../../app/services";
import {screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MyAssignments} from "../../app/components/pages/MyAssignments";
import {mockMyAssignments, mockUser} from "../../mocks/data";
import {renderTestEnvironment} from "../testUtils";
import {DDMMYYYY_REGEX, DAYS_AGO, dayMonthYearStringToDate, SOME_FIXED_FUTURE_DATE} from "../dateUtils";
import produce from "immer";


const FILTER_LABEL_TEXT = siteSpecific("Filter assignments by name", "Filter quizzes by name");

describe("MyAssignments", () => {

    const renderMyAssignments = (extraEndpoints?: HttpHandler[]) => {
        renderTestEnvironment({
            PageComponent: MyAssignments,
            initalRouteEntries: [PATHS.MY_ASSIGNMENTS],
            extraEndpoints
        });
    };

    it('should show all assignments on render', async () => {
        renderMyAssignments();
        const assignments = await screen.findAllByTestId("my-assignment");
        expect(assignments).toHaveLength(mockMyAssignments.length);
    });

    it('should render with "All" assignment filter selected by default', async () => {
        renderMyAssignments();
        const assignmentTypeFilter = await screen.findByTestId("assignment-type-filter");
        expect(assignmentTypeFilter).toHaveValue("All");
    });

    it('should allow users to filter assignments on gameboard title', async () => {
        renderMyAssignments();
        const filter = await siteSpecific(() => screen.findByPlaceholderText(FILTER_LABEL_TEXT), () => screen.findByLabelText(FILTER_LABEL_TEXT))();
        await userEvent.type(filter, "Test Gameboard 3");
        // Only one assignment should be shown
        expect(await screen.findAllByTestId("my-assignment")).toHaveLength(1);
        // Cleanup filter
        await userEvent.clear(filter);
        // Expect to see all assignments again
        expect(await screen.findAllByTestId("my-assignment")).toHaveLength(mockMyAssignments.length);
    });

    it('should filter to only display "Older" assignments when that filter type is selected, this should not display any assignments', async () => {
        renderMyAssignments();
        const assignmentTypeFilter = await screen.findByTestId("assignment-type-filter");
        await userEvent.selectOptions(assignmentTypeFilter, "To do (older)");
        expect(screen.queryAllByTestId("my-assignment")).toHaveLength(0);
    });

    it('should contain assignments with undefined due date and older than a month when the "Older" assignments filter is selected', async () => {
        renderMyAssignments([
            http.get(API_PATH + "/assignments", () => {
                let d = new Date();
                d.setUTCDate(d.getUTCDate() - 1);
                d.setUTCMonth(d.getUTCMonth() - 1);
                const assignmentsWithOneOld = produce<any[]>(mockMyAssignments, as => {
                    as[0].creationDate = d.valueOf();
                    as[0].scheduledStartDate = d.valueOf();
                    delete as[0].dueDate;
                });
                return HttpResponse.json(assignmentsWithOneOld, {
                    status: 200,
                });
            })
        ]);
        // Wait for the default ("All") assignments to show up
        expect(await screen.findAllByTestId("my-assignment")).toHaveLength(mockMyAssignments.length);
        // Select the "Older Assignments" filter
        const assignmentTypeFilter = await screen.findByTestId("assignment-type-filter");
        await userEvent.selectOptions(assignmentTypeFilter, "To do (older)");
        // Wait for the one old assignment that we expect
        expect(await screen.findAllByTestId("my-assignment")).toHaveLength(1);
    });

    it('should show the scheduled start date as the "Assigned" date if it exists', async () => {
        renderMyAssignments([
            http.get(API_PATH + "/assignments", () => {
                return HttpResponse.json([
                    {
                        id: 37,
                        gameboardId: "test-gameboard",
                        gameboard: {
                            id: "test-gameboard",
                            title: "Test Gameboard",
                            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
                            ownerUserId: 1,
                            tags: [
                                "ISAAC_BOARD"
                            ],
                            creationMethod: "BUILDER"
                        },
                        groupId: 2,
                        groupName: "Test Group 1",
                        ownerUserId: mockUser.id,
                        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
                        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5, true),
                        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -1, true),
                    }
                ],
                {
                    status: 200,
                });
            })
        ]);
        const myAssignment = await screen.findByTestId("my-assignment");
        const assignedDateEl = within(myAssignment).getByTestId("gameboard-assigned");
        const assignedDate = assignedDateEl?.textContent?.replace(/Assigned:\s?/, "");
        expect(assignedDate).toMatch(DDMMYYYY_REGEX);
        expect(dayMonthYearStringToDate(assignedDate)?.valueOf()).toEqual(DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -1, true));
    });

    it('should show the assignment creation date as the "Assigned" date if the scheduled start date does not exist', async () => {
        renderMyAssignments([
            http.get(API_PATH + "/assignments", () => {
                return HttpResponse.json([
                    {
                        id: 37,
                        gameboardId: "test-gameboard",
                        gameboard: {
                            id: "test-gameboard",
                            title: "Test Gameboard",
                            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
                            ownerUserId: 1,
                            tags: [
                                "ISAAC_BOARD"
                            ],
                            creationMethod: "BUILDER"
                        },
                        groupId: 2,
                        groupName: "Test Group 1",
                        ownerUserId: mockUser.id,
                        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
                        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5, true)
                    }
                ],
                {
                    status: 200,
                });
            })
        ]);
        const myAssignment = await screen.findByTestId("my-assignment");
        const assignedDateEl = within(myAssignment).getByTestId("gameboard-assigned");
        const assignedDate = assignedDateEl?.textContent?.replace(/Assigned:\s?/, "");
        expect(assignedDate).toMatch(DDMMYYYY_REGEX);
        expect(dayMonthYearStringToDate(assignedDate)?.valueOf()).toEqual(DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3, true));
    });

    it('should show the notes field for assignments with notes', async () => {
        // Arrange
        renderMyAssignments();
        await screen.findAllByTestId("my-assignment");

        // Act & Assert
        expect(screen.getAllByText("Notes:")).toHaveLength(1);
        expect(screen.getByText("This is cool")).toBeInTheDocument();
    });
});
