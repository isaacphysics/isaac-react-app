import { EventGenderDetails } from "../../../../../app/components/elements/panels/EventGenderDetails";
import { mockEventBookings } from "../../../../../mocks/data";
import { renderTestEnvironment } from "../../../../utils";
import { screen, within } from "@testing-library/react";

const findTableDetails = () => {
  const studentRow = screen.getByRole("row", {
    name: /student/i,
  });
  const teacherRow = screen.getByRole("row", {
    name: /teacher/i,
  });
  const studentGenders = [...studentRow.getElementsByTagName("td")];
  const teacherGenders = [...teacherRow.getElementsByTagName("td")];
  [studentGenders, teacherGenders].forEach((each) => expect(each).toHaveLength(6));
  return { studentGenders, teacherGenders };
};

const checkGenderCounts = (genders: HTMLTableCellElement[], expectedCounts: string[]) => {
  genders.forEach((cell, index) => {
    expect(cell).toHaveTextContent(expectedCounts[index]);
  });
};

describe("EventGenderDetails", () => {
  const setupTest = (props = {}) => {
    renderTestEnvironment({
      PageComponent: EventGenderDetails,
      componentProps: {
        ...props,
      },
      initialRouteEntries: ["/admin/events/"],
    });
  };

  it("shows a table with correct column headers for genders", () => {
    setupTest({ eventBookings: [] });
    const eventGenders = screen.getByTestId("event-genders");
    expect(eventGenders).toHaveTextContent("Attended bookings table:");
    const genderStatsTable = screen.getByRole("table");
    expect(genderStatsTable).toBeInTheDocument();
    const tableHeader = within(genderStatsTable).getAllByRole("columnheader");
    expect(tableHeader).toHaveLength(7);
    const genders = ["Male", "Female", "Other", "Prefer not to say", "Unknown", "Total"];
    tableHeader.slice(1).forEach((columnHeader, index) => expect(columnHeader).toHaveTextContent(genders[index]));
  });

  it("shows a row of gender stats for student and teacher", () => {
    setupTest({ eventBookings: [] });
    const studentRow = screen.getByRole("rowheader", {
      name: /student/i,
    });
    const teacherRow = screen.getByRole("rowheader", {
      name: /teacher/i,
    });
    [studentRow, teacherRow].forEach((row) => expect(row).toBeInTheDocument());
  });

  it("renders 0 count genders when there are no event bookings", () => {
    setupTest({ eventBookings: [] });
    const { studentGenders, teacherGenders } = findTableDetails();
    checkGenderCounts(studentGenders, ["0 (0%)", "0 (0%)", "0 (0%)", "0 (0%)", "0 (0%)", "0"]);
    checkGenderCounts(teacherGenders, ["0 (0%)", "0 (0%)", "0 (0%)", "0 (0%)", "0 (0%)", "0"]);
  });

  it("renders a list of genders with correct counts when there are event bookings", () => {
    setupTest({ eventBookings: mockEventBookings });
    const { studentGenders, teacherGenders } = findTableDetails();
    const expectedStudentCounts = ["1 (33%)", "0 (0%)", "1 (33%)", "0 (0%)", "1 (33%)", "3"];
    const expectedTeacherCounts = ["0 (0%)", "1 (50%)", "0 (0%)", "1 (50%)", "0 (0%)", "2"];
    checkGenderCounts(studentGenders, expectedStudentCounts);
    checkGenderCounts(teacherGenders, expectedTeacherCounts);
  });
});
