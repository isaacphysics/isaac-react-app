import React from "react";
import { EventBookingDTO, UserRole } from "../../../../IsaacApiTypes";
import { Col, Table, UncontrolledTooltip } from "reactstrap";
import { asPercentage } from "../../../services";

export const countEventDetailsByRole = (role: UserRole, eventBookings: EventBookingDTO[]) => {
  const countByRole = {
    genders: {
      male: 0,
      female: 0,
      other: 0,
      preferNotToSay: 0,
      unknown: 0,
    },
    numberOfConfirmedOrAttendedBookings: 0,
  };

  eventBookings.forEach((booking) => {
    const gender = booking.userBooked?.gender;
    const bookingStatus = booking.bookingStatus;
    const userRole = booking.userBooked?.role;

    const meetsRoleRequirements = userRole === role;

    if (
      booking.userBooked &&
      bookingStatus &&
      ["CONFIRMED", "ATTENDED"].includes(bookingStatus) &&
      meetsRoleRequirements
    ) {
      countByRole.numberOfConfirmedOrAttendedBookings++;

      switch (gender) {
        case "MALE":
          countByRole.genders.male++;
          break;
        case "FEMALE":
          countByRole.genders.female++;
          break;
        case "OTHER":
          countByRole.genders.other++;
          break;
        case "PREFER_NOT_TO_SAY":
          countByRole.genders.preferNotToSay++;
          break;
        case "UNKNOWN":
        case undefined:
        default:
          countByRole.genders.unknown++;
          break;
      }
    }
  });

  return countByRole;
};

export const EventGenderDetails = ({ eventBookings }: { eventBookings: EventBookingDTO[] }) => {
  const studentDetails = countEventDetailsByRole("STUDENT", eventBookings);
  const teacherDetails = countEventDetailsByRole("TEACHER", eventBookings);
  const genderData = {
    student: Object.entries(studentDetails.genders),
    teacher: Object.entries(teacherDetails.genders),
  };

  return (
    <>
      <p data-testid="event-genders">
        <strong>Gender:</strong>
        <span id={`gender-stats-tooltip`} className="icon-help ml-1" />
        <UncontrolledTooltip className="text-nowrap" target={`gender-stats-tooltip`} placement="right">
          User gender of CONFIRMED or ATTENDED bookings
        </UncontrolledTooltip>
      </p>
      <Col xs={12} md={10} className="overflow-auto">
        <Table bordered className="mb-0 bg-white table-hover table-sm" style={{ maxWidth: "100%" }}>
          <thead>
            <tr>
              {["", "Male", "Female", "Other", "Prefer not to say", "Unknown"].map((columnHeader) => (
                <th scope="col" key={columnHeader} className="text-nowrap">
                  {columnHeader}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Student</th>
              {genderData.student.map(([label, value]) => (
                <td key={`student-${label}`}>{`${value} (${asPercentage(
                  value,
                  studentDetails.numberOfConfirmedOrAttendedBookings,
                )}%)`}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Teacher</th>
              {genderData.teacher.map(([label, value]) => (
                <td key={`teacher-${label}`}>{`${value} (${asPercentage(
                  value,
                  teacherDetails.numberOfConfirmedOrAttendedBookings,
                )}%)`}</td>
              ))}
            </tr>
          </tbody>
        </Table>
      </Col>
    </>
  );
};
