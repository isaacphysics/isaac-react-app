import React, {useState} from "react";
import {Accordion} from "../Accordion";
import {
    useRecordUserEventAttendanceMutation
} from "../../../state";
import {atLeastOne, isEventLeader, sortOnPredicateAndReverse} from "../../../services";
import {EventBookingDTO, UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {DateString} from "../DateString";
import {AugmentedEvent, PotentialUser, UserSchoolLookup} from "../../../../IsaacAppTypes";
import { Table, Button, Input } from "reactstrap";

function displayAttendanceAsSymbol(status?: string) {
    switch (status) {
        case "ATTENDED": return "✔️";
        case "ABSENT": return "❌";
        default: return "";
    }
}

interface EventAttendanceProps {
    user: PotentialUser;
    eventId: string;
    event: AugmentedEvent;
    eventBookings: EventBookingDTO[];
    userIdToSchoolMapping: UserSchoolLookup;
}
export const EventAttendance = ({user, eventId, event, eventBookings, userIdToSchoolMapping}: EventAttendanceProps) => {

    const [recordEventAttendance] = useRecordUserEventAttendanceMutation();

    const [sortPredicate, setSortPredicate] = useState("bookingDate");
    const [reverse, setReverse] = useState(true);
    const [familyNameFilter, setFamilyNameFilter] = useState("");

    function filterOnSurname(booking: EventBookingDTO) {
        return booking.userBooked && booking.userBooked.familyName !== undefined &&
            booking.userBooked.familyName.toLocaleLowerCase().includes(familyNameFilter.toLocaleLowerCase());
    }

    let canRecordAttendance = false;
    if (event.date) {
        const morningOfEvent = new Date(event.date);
        morningOfEvent.setUTCHours(0, 0);
        canRecordAttendance = morningOfEvent <= new Date();
    }

    return <>
        {canRecordAttendance && atLeastOne(eventBookings?.length) && <Accordion trustedTitle="Record event attendance" disabled={event.isCancelled && "You cannot record attendance for a cancelled event"}>
            {isEventLeader(user) && <div className="bg-grey p-2 mb-3 text-center">
                As an event leader, you are only able to see the bookings of users who have granted you access to their data.
            </div>}
            <div className="overflow-auto">
                <Table bordered className="mb-0 bg-white">
                    <thead>
                        <tr>
                            <th className="align-middle">
                                Actions
                            </th>
                            <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('bookingStatus'); setReverse(!reverse);}}>
                                Attendance
                            </Button></th>
                            <th className="align-middle">
                                <Button color="link" onClick={() => {setSortPredicate('userBooked.familyName'); setReverse(!reverse);}}>
                                    Name
                                </Button>
                                <Input className="w-auto" value={familyNameFilter} onChange={e => setFamilyNameFilter(e.target.value)} placeholder="Surname filter" />
                            </th>
                            <th className="align-middle">
                                Job / year group
                            </th>
                            <th className="align-middle">
                                School
                            </th>
                            <th className="align-middle">
                                Account type
                            </th>
                            <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('userBooked.email'); setReverse(!reverse);}}>
                                Email
                            </Button></th>
                            <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('bookingDate'); setReverse(!reverse);}}>
                                Booking created
                            </Button></th>
                            <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('updated'); setReverse(!reverse);}}>
                                Booking updated
                            </Button></th>
                            <th className="align-middle">
                                Accessibility requirements
                            </th>
                            <th className="align-middle">
                                Medical requirements
                            </th>
                            <th className="align-middle">
                                Emergency name
                            </th>
                            <th className="align-middle">
                                Emergency telephone
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...eventBookings]?.sort(sortOnPredicateAndReverse(sortPredicate, reverse))
                            .filter(filterOnSurname)
                            .map(booking => {
                                const userBooked = booking.userBooked as UserSummaryWithEmailAddressDTO;
                                const additionalInformation = booking.additionalInformation;
                                const userSchool = booking.userBooked && userIdToSchoolMapping?.[booking.userBooked.id as number];

                                return <tr key={booking.bookingId}>
                                    <td className="align-middle">
                                        {booking.bookingStatus != 'ATTENDED' && <Button color="primary" outline className="btn-sm mb-2"
                                            onClick={() => recordEventAttendance({eventId, userId: userBooked.id as number, attended: true})}
                                        >
                                            Mark&nbsp;as Attended
                                        </Button>}
                                        {booking.bookingStatus != 'ABSENT' && <Button color="primary" outline className="btn-sm mb-2"
                                            onClick={() => recordEventAttendance({eventId, userId: userBooked.id as number, attended: false})}
                                        >
                                            Mark&nbsp;as Absent
                                        </Button>}
                                    </td>
                                    <td className="align-middle text-center">{displayAttendanceAsSymbol(booking.bookingStatus)}</td>
                                    <td className="align-middle">{userBooked.familyName}, {userBooked.givenName}</td>
                                    <td className="align-middle">{additionalInformation?.jobTitle || additionalInformation?.yearGroup || ""}</td>
                                    {(userSchool === undefined || !userSchool.urn) && <td className="align-middle">{userSchool ? userSchool.name : ""}</td>}
                                    {userSchool && userSchool.urn && <td className="align-middle">{userSchool.name}</td>} {/* In future can add link to school stats page */}
                                    <td className="align-middle">{userBooked.role}</td>
                                    <td className="align-middle">{userBooked.email}</td>
                                    <td className="align-middle"><DateString>{booking.bookingDate}</DateString></td>
                                    <td className="align-middle"><DateString>{booking.updated}</DateString></td>
                                    <td className="align-middle">{additionalInformation?.accessibilityRequirements || ""}</td>
                                    <td className="align-middle">{additionalInformation?.medicalRequirements || ""}</td>
                                    <td className="align-middle">{additionalInformation?.emergencyName || ""}</td>
                                    <td className="align-middle">{additionalInformation?.emergencyNumber || ""}</td>
                                </tr>;
                            })
                        }
                    </tbody>
                </Table>
            </div>
        </Accordion>}
    </>;
};
