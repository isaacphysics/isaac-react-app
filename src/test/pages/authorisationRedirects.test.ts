import {renderTestEnvironment} from "../utils";
import {screen, waitFor, within} from "@testing-library/react";
import {history, isAda, isPhy, PATHS, siteSpecific, TEACHER_REQUEST_ROUTE} from "../../app/services";

const tutorOnlyRoutes = [PATHS.SET_ASSIGNMENTS, "/groups"];
describe("Visiting a tutor-only page", () => {

    it('should redirect anonymous users to login', async () => {
        await renderTestEnvironment({role: "ANONYMOUS"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of tutorOnlyRoutes) {
            history.replace(route);
            await waitFor(() => {
                expect(history.location.pathname).toEqual("/login");
            });
        }
    });

    it('should redirect student users to teacher account contact page', async () => {
        await renderTestEnvironment({role: "STUDENT"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of tutorOnlyRoutes) {
            history.replace(route);
            await waitFor(() => {
                expect(history.location.pathname).toEqual(TEACHER_REQUEST_ROUTE);
            });
        }
    });

    it('should not redirect tutors', async () => {
        await renderTestEnvironment({role: "TUTOR"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of tutorOnlyRoutes) {
            history.replace(route);
            await new Promise((r) => setTimeout(r, 100)); // Wait 100ms
            expect(history.location.pathname).toEqual(route);
        }
    });

    it('should not redirect teachers', async () => {
        await renderTestEnvironment({role: "TEACHER"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of tutorOnlyRoutes) {
            history.replace(route);
            await new Promise((r) => setTimeout(r, 100)); // Wait 100ms
            expect(history.location.pathname).toEqual(route);
        }
    });

    it('should not redirect admins', async () => {
        await renderTestEnvironment({role: "ADMIN"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of tutorOnlyRoutes) {
            history.replace(route);
            await new Promise((r) => setTimeout(r, 100)); // Wait 100ms
            expect(history.location.pathname).toEqual(route);
        }
    });
});

const teacherOnlyRoutes = [siteSpecific("/set_tests", PATHS.SET_ASSIGNMENTS)];
describe("Visiting a teacher-only page", () => {

    isAda && it('should show "Teacher upgrade" page to students', async () => {
        await renderTestEnvironment({role: "STUDENT"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of teacherOnlyRoutes) {
            history.replace(route);
            const titleElement = await screen.findByTestId("main-heading");
            await within(titleElement).findByText("Mock page: teacher_accounts");
            expect(history.location.pathname).toEqual("/pages/teacher_accounts");
        }
    });

    // Cannot test a teacher-but-not-tutor page on Ada since there are no such pages
    isPhy && it('should show "Access denied" page to tutors', async () => {
        await renderTestEnvironment({role: "TUTOR"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of teacherOnlyRoutes) {
            history.replace(route);
            const titleElement = await screen.findByTestId("main-heading");
            await within(titleElement).findByText("Access denied");
            expect(history.location.pathname).toEqual(route);
        }
    });

    it('should not redirect teachers', async () => {
        await renderTestEnvironment({role: "TEACHER"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of teacherOnlyRoutes) {
            history.replace(route);
            await new Promise((r) => setTimeout(r, 100)); // Wait 100ms
            expect(history.location.pathname).toEqual(route);
        }
    });
});