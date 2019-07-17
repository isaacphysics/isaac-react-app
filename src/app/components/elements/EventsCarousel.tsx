import React from "react";
import ResponsiveCarousel from "./Carousel";
import {EventCard} from "./EventCard";

export const EventsCarousel = () => {
    return (
        <div className="events-carousel">
            <ResponsiveCarousel>
                <EventCard
                    eventImage={"/assets/teacher.svg"} eventTitle={"Teacher CPD - OOP @ University of Southampton"}
                    eventSubtitle={"A free CPD workshop for A-level teachers"}
                    eventDate={"Mon 8 July 2019"} eventTime={"10:00 AM — 4:00 PM"} eventLocation={"Computer Science Building, Southampton"}
                    eventUrl={"https://www.eventbrite.com/e/teacher-cpd-object-oriented-programming-university-of-southampton-tickets-62039047461"}
                />
                <EventCard
                    eventImage={"/assets/student.svg"} eventTitle={"Discovery @ Queen Mary's University of London"}
                    eventSubtitle={"Inspiring the next generation of Computer Scientists"}
                    eventDate={"Mon 8 July 2019"} eventTime={"10:00 AM — 3:00 PM"} eventLocation={"Queen Mary University of London, London"}
                    eventUrl={"https://www.eventbrite.co.uk/e/discovery-queen-marys-university-of-london-tickets-63571521131"}
                />
                <EventCard
                    eventImage={"/assets/teacher.svg"} eventTitle={"Teacher CPD - OOP @ University of Newcastle"}
                    eventSubtitle={"A free CPD workshop for A level teachers"}
                    eventDate={"Tue 9 July 2019"} eventTime={"9:30 AM — 3:30 PM"} eventLocation={"School of Computing, Newcastle"}
                    eventUrl={"https://www.eventbrite.co.uk/e/teacher-cpd-newcastle-university-tickets-60919708488"}
                />
                <EventCard
                    eventImage={"/assets/student.svg"} eventTitle={"Student A Level Masterclass @ University of Southampton"}
                    eventSubtitle={"Smartwatch Project: free masterclass for A-level Computer Science students"}
                    eventDate={"Wed 10 July 2019"} eventTime={"10:00 AM — 4:00 PM"} eventLocation={"Computer Science Building, Southampton"}
                    eventUrl={"https://www.eventbrite.co.uk/e/student-a-level-masterclass-university-of-southampton-tickets-63640746185"}
                />
                <EventCard
                    eventImage={"/assets/student.svg"} eventTitle={"Student A Level Masterclass @ Newcastle University"}
                    eventSubtitle={"Free masterclass for A-Level Computer Science students."}
                    eventDate={"Thu 11 July 2019"} eventTime={"10:00 AM — 3:00 PM"} eventLocation={"School of Computing, Newcastle"}
                    eventUrl={"https://www.eventbrite.co.uk/e/student-a-level-masterclass-newcastle-university-tickets-60920082607"}
                />
                <EventCard
                    eventImage={"/assets/teacher.svg"} eventTitle={"Teacher CPD @ Newcastle University"}
                    eventSubtitle={"A free CPD workshop for A level teachers"}
                    eventDate={"Tue 16 July 2019"} eventTime={"9:30 AM — 3:30 PM"} eventLocation={"School of Computing, Newcastle"}
                    eventUrl={"https://www.eventbrite.co.uk/e/teacher-cpd-newcastle-university-tickets-60920301261"}
                />
            </ResponsiveCarousel>
        </div>
    )
};
