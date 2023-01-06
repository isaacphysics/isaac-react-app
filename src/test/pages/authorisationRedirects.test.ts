import {renderTestEnvironment} from "../utils";
import {screen, waitFor} from "@testing-library/react";
import {history} from "../../app/services";

const tutorOnlyRoutes = ["/set_assignments", "/groups"];
describe("Visiting a tutor-only page", () => {

    it('should redirect anonymous users to login', async () => {
        renderTestEnvironment({role: "ANONYMOUS"});
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
        renderTestEnvironment({role: "STUDENT"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of tutorOnlyRoutes) {
            history.replace(route);
            await waitFor(() => {
                expect(history.location.pathname).toEqual("/request_account_upgrade");
            });
        }
    });

    it('should not redirect tutors', async () => {
        renderTestEnvironment({role: "TUTOR"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of tutorOnlyRoutes) {
            history.replace(route);
            await new Promise((r) => setTimeout(r, 100)); // Wait 100ms
            expect(history.location.pathname).toEqual(route);
        }
    });

    it('should not redirect teachers', async () => {
        renderTestEnvironment({role: "TEACHER"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of tutorOnlyRoutes) {
            history.replace(route);
            await new Promise((r) => setTimeout(r, 100)); // Wait 100ms
            expect(history.location.pathname).toEqual(route);
        }
    });

    it('should not redirect admins', async () => {
        renderTestEnvironment({role: "ADMIN"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of tutorOnlyRoutes) {
            history.replace(route);
            await new Promise((r) => setTimeout(r, 100)); // Wait 100ms
            expect(history.location.pathname).toEqual(route);
        }
    });
});

const teacherOnlyRoutes = ["/set_tests"];
describe("Visiting a teacher-only page", () => {

    it('should show "Access denied" page to tutors', async () => {
        renderTestEnvironment({role: "TUTOR"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of teacherOnlyRoutes) {
            history.replace(route);
            await screen.findByText("Access denied");
            expect(history.location.pathname).toEqual(route);
        }
    });

    it('should not redirect teachers', async () => {
        renderTestEnvironment({role: "TEACHER"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        for (const route of teacherOnlyRoutes) {
            history.replace(route);
            await new Promise((r) => setTimeout(r, 100)); // Wait 100ms
            expect(history.location.pathname).toEqual(route);
        }
    });
});