import React, {useEffect} from "react";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {ShowLoading} from "../handlers/ShowLoading";
import {EVENTS_CRUMB} from "../../services/constants";
import {AugmentedEvent} from "../../../IsaacAppTypes";
import {getEvent} from "../../state/actions";

export const EventDetails = ({match: {params: {eventId}}}: {match: {params: {eventId: string}}}) => {
    const dispatch = useDispatch();
    const currentEvent = useSelector((state: AppState) => state && state.currentEvent);

    useEffect(() => {
        dispatch(getEvent(eventId));
    }, [eventId]);

    return <ShowLoading until={currentEvent} render={(currentEvent: AugmentedEvent) => <RS.Container>
        <TitleAndBreadcrumb
            currentPageTitle={currentEvent.title as string} subTitle={currentEvent.subtitle} intermediateCrumbs={[EVENTS_CRUMB]}
        />

        <RS.Card>
            Some event stuff
        </RS.Card>

    </RS.Container>} />;
};


/*
<div class="event-detail" >
  <div class="medium-16 large-10 columns event-detail-main" ng-class="{expired: event.expired}">

    <div class="event-type hide-for-medium-up">
      <span class="icon-stack" ng-if="event.teacher">
        <span class="icon-hexagon"></span>
        <span class="icon-teacher" title="Teacher Event"></span>
      </span>
      <span class="icon-stack" ng-if="event.student">
        <span class="icon-hexagon"></span>
        <span class="icon-student" title="Student Event"></span>
      </span>
      <span class="icon-stack" ng-if="event.virtual">
        <span class="icon-hexagon"></span>
        <span class="icon-virtual" title="Virtual Event"></span>
      </span>
      <h6><span ng-if="event.teacher">Teacher</span><span ng-if="event.student">Student</span><span ng-if="event.teacher || event.student"> event </span><span ng-if="event.virtual">(Virtual)</span></h6>
      <!-- Having an image size of 500x276 ensures a high resolution on mobile -->
      <div ng-if="event.inProgress && event.virtual" class="event-live"></div><img class="event-img" ng-src="{{event.eventThumbnail.src}}" alt="{{event.eventThumbnail.altText}}" />
    </div>


<!--
Title
-->
    <a ng-click="googleCalendarTemplate()" ng-if="isStaffUser"><span class="calendar-img" alt="Add to Google Calendar">Add to Calendar</span></a>
    <h1>{{event.title}}</h1>
    <p class="event-subtitle">{{event.subtitle}}</p>

    <a ng-if="false" href="javascript:void(0)" ui-sref="contact" class="ru-button-big left">Contact us to book</a>

<!--
Key event info - location, date etc
-->
      <table class="event-table">
        <tbody>
          <tr ng-if="event.field">
            <td>Field:</td>
            <td>{{toTitleCase(event.field)}}</td>
          </tr>
          <tr>
            <td>When:</td>
            <td>
              <time datetime="{{event.date | date:'yyyy-MM-dd H:mm a'}}">{{event.date | date : 'EEE d MMM yyyy'}} {{event.date | date:'shortTime'}}</time>
              <span ng-if="event.endDate != event.date && event.multiDay"> &#8212; <time datetime="{{event.endDate | date:'yyyy-MM-dd H:mm'}}">{{event.endDate | date : 'EEE d MMM yyyy'}} {{event.endDate | date:'shortTime'}}</time></span>
              <span ng-if="event.endDate != event.date && !event.multiDay"> &#8212; <time datetime="{{event.endDate | date:'yyyy-MM-dd H:mm'}}">{{event.endDate | date:'shortTime'}}</time></span>
              <span ng-if="event.expired" class="error">This event is in the past.</span>
            </td>
          </tr>
          <tr ng-show="event.location.address.addressLine1">
            <td>Location:</td>
            <td>{{event.location.address.addressLine1}}, {{event.location.address.addressLine2}}, {{event.location.address.town}}, {{event.location.address.postalCode}}</td>
          </tr>
          <tr ng-show="event.numberOfPlaces && event.eventStatus != 'CLOSED' && !event.expired">
            <td>Availability</td>
            <td>
              <span ng-show="event.placesAvailable > 0">{{event.placesAvailable}} spaces</span>
              <span ng-show="event.placesAvailable <= 0"><strong style="color:red">FULL</strong><span ng-show="(event.tags.indexOf('student') != -1 && user.role != 'STUDENT')"> - for student bookings</span></span>
              <span ng-show="user.email && event.userBooked"> - <span style="color:green">You are booked on this event!</span> </span>
              <span ng-if="!event.userBooked && !event.userOnWaitList && event.placesAvailable <= 0 && !(event.tags.indexOf('student') != -1 && user.role != 'STUDENT')"> - Waiting list booking is available!</span>
              <!-- <span style="color:green" ng-if="!event.userBooked && !event.userOnWaitList && event.placesAvailable <= 0 && (event.tags.indexOf('student') != -1 && user.role != 'STUDENT')"> - Teacher places available!</span> -->
              <span ng-show="user.email && event.userOnWaitList"> - You are on the waiting list for this event.</span></td>
          </tr>
          <tr ng-show="event.bookingDeadline">
            <td>Booking Deadline</td>
            <td>
              <time datetime="{{event.bookingDeadline | date:'yyyy-MM-dd H:mm a'}}">{{event.bookingDeadline | date:'EEE d MMM yyyy'}} <br><span ng-if="!event.multiDay">{{event.bookingDeadline | date:'shortTime'}}</span></time>
              <span ng-if="!event.withinBookingDeadline" class="error">The booking deadline for this event has passed.</span>
            </td>
          </tr>
        </tbody>
      </table>

<!--
Event body copy
-->
      <div isaac-content doc="event"></div>

      <div class="event-booking-form" ng-show="user.email && event.eventStatus != 'CLOSED' && !event.expired && bookingFormOpen && !(event.userBooked || event.userOnWaitList)">
            <div event-booking-form ></div>

          <span ng-if="!event.expired">
            <p ng-if="user._id && event.numberOfPlaces > 0 && !event.userBooked && !bookingDeadlinePast && (event.placesAvailable > 0 || (event.tags.indexOf('student') != -1 && user.role != 'STUDENT'))" href="javascript:void(0)"><small>By requesting to book on this event, you are granting event organisers access to the information provided in the form above. You are also giving them permission to set you pre-event work and view your progress. You can manage access to your progress data in your <a ui-sref="accountSettings">account settings</a>.</small></p>

            <a ng-if="user._id && event.numberOfPlaces > 0 && !event.userBooked && !bookingDeadlinePast && event.eventStatus != 'WAITING_LIST_ONLY' && (event.placesAvailable > 0 || (event.tags.indexOf('student') != -1 && user.role != 'STUDENT'))" href="javascript:void(0)" ng-click="requestBooking()" class="ru-button-big">Book now</a>

            <a ng-if="user._id && event.numberOfPlaces > 0 && !event.userBooked && !event.userOnWaitList && (event.eventStatus == 'WAITING_LIST_ONLY' || event.placesAvailable <= 0 || bookingDeadlinePast) && !(event.tags.indexOf('student') != -1 && user.role != 'STUDENT')" href="javascript:void(0)" ng-click="addToWaitingList()" class="ru-button-big">Apply<span ng-if="bookingDeadlinePast"> - deadline past</span></a>
          </span>
      </div>

      <!-- options for those not logged in -->
      <span ng-show="!user._id">
        <a ng-if="!user._id && event.eventStatus != 'CLOSED' && !event.expired && event.numberOfPlaces > 0 && !bookingDeadlinePast" href="javascript:void(0)" ui-sref="login({target: $root.relativeCanonicalUrl=='/' ? null : $root.relativeCanonicalUrl})" class="ru-button-big">Login to Book</a>

        <a ng-if="!user._id && event.eventStatus != 'CLOSED' && !event.expired && (event.numberOfPlaces <= 0 || bookingDeadlinePast)" href="javascript:void(0)" ui-sref="login({target: $root.relativeCanonicalUrl=='/' ? null : $root.relativeCanonicalUrl})" class="ru-button-big">Login to apply</a>
      </span>

      <!-- options for those logged in -->
      <span ng-show="user._id">
        <a href="javascript:void(0)" ng-show="event.eventStatus != 'CLOSED' && !event.expired && !bookingFormOpen && !(event.userBooked || event.userOnWaitList) && event.withinBookingDeadline" ng-click="bookingFormOpen=true" class="ru-button-big">Open booking form</a>
        <a href="javascript:void(0)" ng-show="bookingFormOpen  && !(event.userBooked || event.userOnWaitList)" ng-click="bookingFormOpen=false" class="ru-button-big secondary">Close booking form</a>
        <a ng-if="event.userBooked && !event.expired" href="javascript:void(0)" ng-click="cancelEventBooking()" class="ru-button-big secondary disabled">Cancel your booking</a>
        <a ng-if="event.userOnWaitList && !event.expired" href="javascript:void(0)" ng-click="cancelEventBooking()" class="ru-button-big secondary disabled">Remove from waiting list</a>
      </span>

      <a href="javascript:void(0)" ui-sref="events" class="ru-button-big secondary">Back to events</a>
    </div>
    <div class="medium-16 large-6 columns event-detail-aside" ng-class="{expired: event.expired}">
      <div class="row">
        <div class="medium-8 large-16 columns" >
          <div class="event-type show-for-medium-up">
            <span class="icon-stack" ng-if="event.teacher">
              <span class="icon-hexagon"></span>
              <span class="icon-teacher"></span>
            </span>
            <span class="icon-stack" ng-if="event.student">
              <span class="icon-hexagon"></span>
              <span class="icon-student"></span>
            </span>
            <span class="icon-stack" ng-if="event.virtual">
              <span class="icon-hexagon"></span>
              <span class="icon-virtual"></span>
            </span>
            <h6><span ng-if="event.teacher">Teacher</span><span ng-if="event.student">Student</span><span ng-if="event.teacher || event.student"> event </span><span ng-if="event.virtual">(Virtual)</span></h6>
            <!-- Having an image size of 500x276 ensures a high resolution on mobile -->
            <div ng-if="event.inProgress && event.virtual" class="event-live"></div><img class="event-img" ng-src="{{event.eventThumbnail.src}}" alt="{{event.eventThumbnail.altText}}" />
          </div>
    </div>

    <div class="medium-8 large-16 columns" ng-show="event.location.address.addressLine1">

<!--
Map
-->
          <div class="event-map">
            <a target="_blank" href="https://www.google.co.uk/maps?q={{event.location.address.addressLine1}},{{event.location.address.town}},{{event.location.address.postalCode}}">
              <img ng-src="https://maps.googleapis.com/maps/api/staticmap?zoom=15&size=604x644&maptype=roadmap&key=AIzaSyBcVr1HZ_JUR92xfQZSnODvvlSpNHYbi4Y&markers={{event.location.address.addressLine1}},{{event.location.address.town}},{{event.location.address.postalCode}}" alt="" />
            </a>
            <h4>{{event.location.address.town}}, {{event.location.address.postalCode}}</h4>
      </div>
    </div>
  </div>
</div>
</div>

<div json-ld-writer script="jsonLd"></div>
 */
