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
import { useTranslation } from 'react-i18next'

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
    const { t } = useTranslation()

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
        {canRecordAttendance && atLeastOne(eventBookings?.length) && <Accordion trustedTitle="Record event attendance" disabled={event.isCancelled && t('youCannotRecordAttendanceForACancelledEvent', 'You cannot record attendance for a cancelled event')}>
            {isEventLeader(user) && <div className="bg-grey p-2 mb-3 text-center">
                {t('asAnEventLeaderYouAreOnlyAbleToSeeTheBookingsOfUsersWhoHaveGrantedYouAccessToTheirData', 'As an event leader, you are only able to see the bookings of users who have granted you access to their data.')}
            </div>}
            <div className="overflow-auto">
                <Table bordered className="mb-0 bg-white">
                    <thead>
                        <tr>
                            <th className="align-middle">
                                {t('actions', 'Actions')}
                            </th>
                            <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('bookingStatus'); setReverse(!reverse);}}>
                                {t('attendance', 'Attendance')}
                            </Button></th>
                            <th className="align-middle">
                                <Button color="link" onClick={() => {setSortPredicate('userBooked.familyName'); setReverse(!reverse);}}>
                                    Name
                                </Button>
                                <Input className="w-auto" value={familyNameFilter} onChange={e => setFamilyNameFilter(e.target.value)} placeholder={t('surnameFilter', 'Surname filter')} />
                            </th>
                            <th className="align-middle">
                                {t('jobYearGroup', 'Job / year group')}
                            </th>
                            <th className="align-middle">
                                {t('school', 'School')}
                            </th>
                            <th className="align-middle">
                                {t('accountType', 'Account type')}
                            </th>
                            <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('userBooked.email'); setReverse(!reverse);}}>
                                {t('email2', 'Email')}
                            </Button></th>
                            <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('bookingDate'); setReverse(!reverse);}}>
                                {t('bookingCreated', 'Booking created')}
                            </Button></th>
                            <th className="align-middle"><Button color="link" onClick={() => {setSortPredicate('updated'); setReverse(!reverse);}}>
                                {t('bookingUpdated', 'Booking updated')}
                            </Button></th>
                            <th className="align-middle">
                                {t('accessibilityRequirements', 'Accessibility requirements')}
                            </th>
                            <th className="align-middle">
                                {t('medicalRequirements', 'Medical requirements')}
                            </th>
                            <th className="align-middle">
                                {t('emergencyName', 'Emergency name')}
                            </th>
                            <th className="align-middle">
                                {t('emergencyTelephone', 'Emergency telephone')}
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
                                        {booking.bookingStatus != 'ATTENDED' && <Button color="keyline" className="btn-sm mb-2"
                                            onClick={() => recordEventAttendance({eventId, userId: userBooked.id as number, attended: true})}
                                        >
                                            {t('marknbspasAttended', 'Mark&nbsp;as Attended')}
                                        </Button>}
                                        {booking.bookingStatus != 'ABSENT' && <Button color="keyline" className="btn-sm mb-2"
                                            onClick={() => recordEventAttendance({eventId, userId: userBooked.id as number, attended: false})}
                                        >
                                            {t('marknbspasAbsent', 'Mark&nbsp;as Absent')}
                                        </Button>}
                                    </td>
                                    <td className="align-middle text-center">{displayAttendanceAsSymbol(booking.bookingStatus)}</td>
                                    <td className="align-middle">{t('familynameGivenname', '{{familyName}}, {{givenName}}', { familyName: userBooked.familyName, givenName: userBooked.givenName })}</td>
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
