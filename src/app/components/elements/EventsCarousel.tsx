import React from "react";
import ResponsiveCarousel from "./Carousel";
import {EventCardPod} from "./EventCardPod";

export const EventsCarousel = () => {
    return (
        <div className="events-carousel">
            <ResponsiveCarousel>
                <EventCardPod
                    eventImage={{src: "/assets/events/student.svg"}} eventTitle={"Discovery @ Lancaster University"}
                    eventSubtitle={"Inspiring the next generation of Computer Scientists"}
                    eventStartDate={"Mon 23 September 2019"} eventEndDate={"9:45 AM — 3:00 PM"} eventLocation={"Faraday Complex, Lancaster University"}
                    eventUrl={"https://www.eventbrite.co.uk/e/discovery-university-of-lancaster-tickets-66648412195"}
                />
                <EventCardPod
                    eventImage={{src: "/assets/events/teacher.svg"}} eventTitle={"Teacher CPD @ Newcastle University"}
                    eventSubtitle={"A free CPD workshop for A level teachers"}
                    eventStartDate={"Tue 16 July 2019"} eventEndDate={"9:30 AM — 3:30 PM"} eventLocation={"School of Computing, Newcastle"}
                    eventUrl={"https://www.eventbrite.co.uk/e/teacher-cpd-newcastle-university-tickets-60920301261"}
                    pastEvent
                />
                <EventCardPod
                    eventImage={{src: "/assets/events/student.svg"}} eventTitle={"Student A Level Masterclass @ Newcastle University"}
                    eventSubtitle={"Free masterclass for A Level Computer Science students."}
                    eventStartDate={"Thu 11 July 2019"} eventEndDate={"10:00 AM — 3:00 PM"} eventLocation={"School of Computing, Newcastle"}
                    eventUrl={"https://www.eventbrite.co.uk/e/student-a-level-masterclass-newcastle-university-tickets-60920082607"}
                    pastEvent
                />
                <EventCardPod
                    eventImage={{src: "/assets/events/student.svg"}} eventTitle={"Student A Level Masterclass @ University of Southampton"}
                    eventSubtitle={"Smartwatch Project: free masterclass for A level Computer Science students"}
                    eventStartDate={"Wed 10 July 2019"} eventEndDate={"10:00 AM — 4:00 PM"} eventLocation={"Computer Science Building, Southampton"}
                    eventUrl={"https://www.eventbrite.co.uk/e/student-a-level-masterclass-university-of-southampton-tickets-63640746185"}
                    pastEvent
                />
                <EventCardPod
                    eventImage={{src: "/assets/events/teacher.svg"}} eventTitle={"Teacher CPD - OOP @ University of Newcastle"}
                    eventSubtitle={"A free CPD workshop for A level teachers"}
                    eventStartDate={"Tue 9 July 2019"} eventEndDate={"9:30 AM — 3:30 PM"} eventLocation={"School of Computing, Newcastle"}
                    eventUrl={"https://www.eventbrite.co.uk/e/teacher-cpd-newcastle-university-tickets-60919708488"}
                    pastEvent
                />
                <EventCardPod
                    eventImage={{src: "/assets/events/student.svg"}} eventTitle={"Discovery @ Queen Mary's University of London"}
                    eventSubtitle={"Inspiring the next generation of Computer Scientists"}
                    eventStartDate={"Mon 8 July 2019"} eventEndDate={"10:00 AM — 3:00 PM"} eventLocation={"Queen Mary University of London, London"}
                    eventUrl={"https://www.eventbrite.co.uk/e/discovery-queen-marys-university-of-london-tickets-63571521131"}
                    pastEvent
                />
            </ResponsiveCarousel>
        </div>
    )
};
