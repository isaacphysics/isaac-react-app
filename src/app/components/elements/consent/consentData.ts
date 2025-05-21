export const consentData = {
  consent: {
    InPersonEventConsent: [
      "I agree to provide the personal information entered on this form (e.g. dietary requirements, accessibility needs, and emergency contact details) to support my participation in the event. I understand that this information will only be shared with those involved in organising and running the event, and will be securely deleted within 30 days of the event.",
      {
        beforeLink:
          "By requesting to book on this event, I also agree to grant event organisers access to the information provided in this form so they can set me pre-event work, view my progress, send event materials, and record my attendance. I understand that my data will be processed in accordance with the ",
        linkText: "Privacy Policy",
        afterLink: ".",
      },
    ],
    VirtualEventConsent: [
      {
        beforeLink:
          "By requesting to book on this event, I agree to grant event organisers access to the information provided in this form so they can set me pre-event work, view my progress, send event materials, and record my attendance. I understand that my data will be processed in accordance with the ",
        linkText: "Privacy Policy",
        afterLink: ".",
      },
    ],
    SignUpConsent: [
      {
        beforeLink:
          "By ticking this box, you are confirming that you have read and agree to the Isaac Computer Science ",
        linkText: "Terms of Use",
        linkTo: "/terms",
        afterLink: " and ",
      },
      {
        beforeLink: "",
        linkText: "Privacy Policy",
        linkTo: "/privacy",
        afterLink: ".",
        sameLine: true, // Add this property to keep it on the same line
      },
    ],
  },
};
