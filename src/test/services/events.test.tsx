import {AugmentedEvent, PotentialUser} from "../../IsaacAppTypes";
import {
    userCanBeAddedToEventWaitingList,
    userCanMakeEventBooking,
    userCanReserveEventSpaces
} from "../../app/services";

let event: AugmentedEvent

const studentUser: PotentialUser = {
    role: "STUDENT",
    loggedIn: true
}

const tutorUser: PotentialUser = {
    role: "TUTOR",
    loggedIn: true
}

const teacherUser: PotentialUser = {
    role: "TEACHER",
    loggedIn: true
}

beforeEach(() => {
    event = {
        isNotClosed: true,
        isWithinBookingDeadline: true,
        isWaitingListOnly: false,
        userBookingStatus: undefined,
        isStudentOnly: false,
        isAStudentEvent: true,
        placesAvailable: 10,
        allowGroupReservations: true
    }
});

["Student", "Tutor"].forEach(role => describe(`${role}s can make event bookings when conditions are met`, () => {

    const user = role === "Student" ? studentUser : tutorUser;

    it("Returns true for an open, pre-deadline, student event with spaces available and logged-in " +
        `${role.toLowerCase()} user with no prior booking or reservation`, () => {
        // Act
        const canBook = userCanMakeEventBooking(user, event)

        // Assert
        expect(canBook).toEqual(true)
    })

    it("Returns false for a closed event", () => {
        // Arrange
        event.isNotClosed = false

        // Act
        const canBook = userCanMakeEventBooking(user, event)

        // Assert
        expect(canBook).toEqual(false);
    })

    it("Returns false for a post-deadline event", () => {
        // Arrange
        event.isWithinBookingDeadline = false

        // Act
        const canBook = userCanMakeEventBooking(user, event)

        // Assert
        expect(canBook).toEqual(false)
    })

    it("Returns false for an event with no spaces available", () => {
        // Arrange
        event.placesAvailable = 0

        // Act
        const canBook = userCanMakeEventBooking(user, event)

        // Assert
        expect(canBook).toEqual(false)
    })

    it("Returns false for an event already booked for the user",
        () => {
        // Arrange
        event.userBookingStatus = 'CONFIRMED'

        // Act
        const canBook = userCanMakeEventBooking(user, event)

        // Assert
        expect(canBook).toEqual(false);
    })

    it("Returns true for a \"student only\" event", () => {
        // Arrange
        event.isStudentOnly = true

        // Act
        const canBook = userCanMakeEventBooking(user, event)

        // Assert
        expect(canBook).toEqual(true)
    })

    it("Returns true for an event already reserved for the user", () => {
        // Arrange
        event.userBookingStatus = 'RESERVED'

        // Act
        const canBook = userCanMakeEventBooking(user, event)

        // Assert
        expect(canBook).toEqual(true);
    })

    it("Returns true for an event already reserved for the user, even if the event is full", () => {
        // Arrange
        event.userBookingStatus = 'RESERVED'
        event.placesAvailable = 0

        // Act
        const canBook = userCanMakeEventBooking(user, event)

        // Assert
        expect(canBook).toEqual(true);
    })

    it("Returns false for a waiting-list-only event", () => {
        // Arrange
        event.isWaitingListOnly = true

        // Act
        const canBook = userCanMakeEventBooking(user, event)

        // Assert
        expect(canBook).toEqual(false)
    })

    it("Returns false for a reservations-only event", () => {
        // Arrange
        event.isReservationOnly = true;

        // Act
        const canMakeEventBooking = userCanMakeEventBooking(studentUser, event);

        // Assert
        expect(canMakeEventBooking).toEqual(false);
    })

    it("Returns true for a reservations-only event, if the user is already reserved", () => {
        // Arrange
        event.isReservationOnly = true;
        event.userBookingStatus = 'RESERVED';

        // Act
        const canMakeEventBooking = userCanMakeEventBooking(studentUser, event);

        // Assert
        expect(canMakeEventBooking).toEqual(true);
    })
}));

describe("Teachers can make event bookings when conditions are met", () => {
    it("Returns true for an open, pre-deadline, student event with spaces available and logged-in " +
        "teacher user with no prior booking or reservation", () => {
        // Act
        const canBook = userCanMakeEventBooking(teacherUser, event)

        // Assert
        expect(canBook).toEqual(true)
    })

    it("Returns true for a teacher event", () => {
        // Arrange
        event.isAStudentEvent = false

        // Act
        const canBook = userCanMakeEventBooking(teacherUser, event)

        // Assert
        expect(canBook).toEqual(true)
    })

    it("Returns false for a closed event", () => {
        // Arrange
        event.isNotClosed = false

        // Act
        const canBook = userCanMakeEventBooking(teacherUser, event)

        // Assert
        expect(canBook).toEqual(false);
    })

    it("Returns false for a post-deadline event", () => {
        // Arrange
        event.isWithinBookingDeadline = false

        // Act
        const canBook = userCanMakeEventBooking(teacherUser, event)

        // Assert
        expect(canBook).toEqual(false)
    })

    it("Returns true for a student event with no spaces available", () => {
        // Arrange
        event.placesAvailable = 0

        // Act
        const canBook = userCanMakeEventBooking(teacherUser, event)

        // Assert
        expect(canBook).toEqual(true)
    })

    it("Returns false for a teacher event with no spaces available", () => {
        // Arrange
        event.placesAvailable = 0
        event.isAStudentEvent = false

        // Act
        const canBook = userCanMakeEventBooking(teacherUser, event)

        // Assert
        expect(canBook).toEqual(false)
    })

    it("Returns false for an event already booked for the teacher", () => {
        // Arrange
        event.userBookingStatus = 'CONFIRMED'

        // Act
        const canBook = userCanMakeEventBooking(teacherUser, event)

        // Assert
        expect(canBook).toEqual(false);
    })

    it("Returns false for a student only event", () => {
        // Arrange
        event.isStudentOnly = true

        // Act
        const canBook = userCanMakeEventBooking(teacherUser, event)

        // Assert
        expect(canBook).toEqual(false)
    })

    it("Returns true for an event reserved for the teacher", () => {
        // Arrange
        event.userBookingStatus = 'RESERVED'

        // Act
        const canBook = userCanMakeEventBooking(teacherUser, event)

        // Assert
        expect(canBook).toEqual(true);
    })

    it("Returns true for an event reserved for the teacher, even if the event is full", () => {
        // Arrange
        event.userBookingStatus = 'RESERVED'
        event.placesAvailable = 0

        // Act
        const canBook = userCanMakeEventBooking(teacherUser, event)

        // Assert
        expect(canBook).toEqual(true);
    })

    it("Returns false for a waiting-list-only event", () => {
        // Arrange
        event.isWaitingListOnly = true

        // Act
        const canBook = userCanMakeEventBooking(teacherUser, event)

        // Assert
        expect(canBook).toEqual(false)
    })

    it("Returns true for a reservations-only event", () => {
        // Arrange
        event.isReservationOnly = true;

        // Act
        const canMakeEventBooking = userCanMakeEventBooking(teacherUser, event);

        // Assert
        expect(canMakeEventBooking).toEqual(true);
    })
})

describe("Teachers can make event reservations when conditions are met", () => {
    it("Returns true for an open, pre-deadline event", () => {
        // Act
        const canReserve = userCanReserveEventSpaces(teacherUser, event)

        // Assert
        expect(canReserve).toEqual(true)
    })

    it("Returns false for an event that disallows group reservations", () => {
        // Arrange
        event.allowGroupReservations = false

        // Act
        const canReserve = userCanReserveEventSpaces(teacherUser, event)

        // Assert
        expect(canReserve).toEqual(false);
    })

    it("Returns false for a closed event", () => {
        // Arrange
        event.isNotClosed = false

        // Act
        const canReserve = userCanReserveEventSpaces(teacherUser, event)

        // Assert
        expect(canReserve).toEqual(false);
    })

    it("Returns false for a post-deadline event", () => {
        // Arrange
        event.isWithinBookingDeadline = false

        // Act
        const canReserve = userCanReserveEventSpaces(teacherUser, event)

        // Assert
        expect(canReserve).toEqual(false)
    })

    it("Returns false for a waiting-list-only event", () => {
        // Arrange
        event.isWaitingListOnly = true

        // Act
        const canReserve = userCanReserveEventSpaces(teacherUser, event)

        // Assert
        expect(canReserve).toEqual(false)
    })

    it("Returns true for a reservation-only event", () => {
        // Arrange
        event.isReservationOnly = true;

        // Act
        const canReserve = userCanReserveEventSpaces(teacherUser, event);

        // Assert
        expect(canReserve).toEqual(true);
    })

    it("Returns false for a student user", () => {
        // Act
        const canReserve = userCanReserveEventSpaces(studentUser, event)

        // Assert
        expect(canReserve).toEqual(false)
    })
})

describe("Students can join event waiting list when conditions are met", () => {
    it("Returns true for an open, pre-deadline, student event with no spaces available and logged-in " +
        "student user with no prior booking or reservation", () => {
        // Arrange
        event.placesAvailable = 0

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(studentUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(true)
    })

    it("Returns false for a closed event", () => {
        // Arrange
        event.placesAvailable = 0
        event.isNotClosed = false

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(studentUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(false);
    })

    it("Returns false for an expired event", () => {
        // Arrange
        event.placesAvailable = 0
        event.hasExpired = true

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(studentUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(false)
    })

    it("Returns false for an event already booked for the student", () => {
        // Arrange
        event.placesAvailable = 0
        event.userBookingStatus = 'CONFIRMED'

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(studentUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(false);
    })

    it("Returns true for a student only event", () => {
        // Arrange
        event.placesAvailable = 0
        event.isStudentOnly = true

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(studentUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(true)
    })

    it("Returns false for an event already reserved for the student", () => {
        // Arrange
        event.placesAvailable = 0
        event.userBookingStatus = 'RESERVED'

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(studentUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(false);
    })

    it("Returns false for an event where the student is already on the waiting list", () => {
        // Arrange
        event.placesAvailable = 0
        event.userBookingStatus = 'WAITING_LIST'

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(studentUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(false);
    })

    it("Returns true for a waiting-list-only event", () => {
        // Arrange
        event.isWaitingListOnly = true

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(studentUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(true)
    })
})

describe("Teachers can join event waiting list when conditions are met", () => {
    it("Returns true for an open, pre-deadline, teacher event with no spaces available and logged-in " +
        "teacher user with no prior booking or reservation", () => {
        // Arrange
        event.placesAvailable = 0
        event.isAStudentEvent = false

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(teacherUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(true)
    })

    it("Returns false for a closed event", () => {
        // Arrange
        event.placesAvailable = 0
        event.isNotClosed = false

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(teacherUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(false);
    })

    it("Returns false for an expired event", () => {
        // Arrange
        event.placesAvailable = 0
        event.hasExpired = true

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(teacherUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(false)
    })

    it("Returns false for a student only event", () => {
        // Arrange
        event.placesAvailable = 0
        event.isStudentOnly = true

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(teacherUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(false)
    })

    it("Returns false for an event already reserved for the teacher", () => {
        // Arrange
        event.placesAvailable = 0
        event.userBookingStatus = 'RESERVED'

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(teacherUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(false);
    })

    it("Returns false for an event already booked for the teacher", () => {
        // Arrange
        event.placesAvailable = 0
        event.userBookingStatus = 'CONFIRMED'

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(teacherUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(false);
    })

    it("Returns false for an event where the teacher is already on the waiting list", () => {
        // Arrange
        event.placesAvailable = 0
        event.userBookingStatus = 'WAITING_LIST'

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(teacherUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(false);
    })

    it("Returns true for a waiting-list-only event", () => {
        // Arrange
        event.isWaitingListOnly = true

        // Act
        const canJoinWaitingList = userCanBeAddedToEventWaitingList(teacherUser, event)

        // Assert
        expect(canJoinWaitingList).toEqual(true)
    })
})
