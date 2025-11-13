import { liveQandASessionDate } from "./dateUtils";
const isBeforeQandALiveSession = liveQandASessionDate > new Date();
export default {
  section1: {
    header: {
      section1: [
        "Calling all computer science fans! We are hosting a national competition to challenge students to imagine, design, and pitch a groundbreaking new product for the Internet of Everything (IOE).",
      ],
      section2: [
        "The competition is a fantastic opportunity for students to apply their knowledge to real-world ideas. Entries open in November 2025 and last until the end of January 2026.",
      ],
    },
    note: {
      entryDetails: "Follow our",
      callToAction: "accounts for updates and sign up to our expression of interest form below for updates via email.",
      xLink: "https://x.com/isaaccompsci",
      facebookLink: "https://www.facebook.com/IsaacComputerScience",
    },
  },

  section3: {
    howItWorks: {
      title: "How does it work?",
      steps: [
        "1. Students ask their teacher to get involved and log in or create an account",
        {
          ...(isBeforeQandALiveSession ? { text: "2. Join our " } : { text: "2. Watch the Q&A session recording" }),
          ...(isBeforeQandALiveSession && {
            link1: {
              text: "live Q&A session",
              href: "https://isaaccomputerscience.org/events/20251113_national_competition_q_and_a",
            },
          }),
          text2: " and boost skills with ",
          link2: { text: "Boosters", href: "https://isaaccomputerscience.org/events" },
          text3: " and ",
          link3: { text: "Gameboards", href: "https://isaaccomputerscience.org/gameboards/new" },
          text4: " (optional)",
        },
        "3. Students create a project, record a video, and ask their teacher to submit it",
        "4. Teachers create (or use) a student group and submit the entry form with a cloud storage link to the project",
        "5. Shortlisted finalists will be invited to Birmingham in May 2026!",
        {
          text5: "Teachers, see our ",
          link5: { text: "FAQ guide", href: "#" },
          text6: " for help and how to enter.",
        },
      ],
    },
    whyJoin: {
      title: "Why join the competition?",
      benefits: [
        "Network with industry leaders: meet professionals, gain insights into potential career paths, and build connections",
        "Enhance computer science knowledge: students can revise for exams through gameboards and practical applications",
        "Showcase your talent: stand out on future university or job applications and earn the title of an IoE innovator",
      ],
    },
    qanda: {
      title: "Q&A - Everything you need to know",
      description: "Learn about the competition essentials to get started",
      videoUrl: "t0ojrm0fMoE",
    },

    eligibility: {
      title: "Who can join?",
      description:
        "Groups of up to 4 students are able to join in! We will also accept individual entries with teacher support.",
      requirements:
        "Eligible participants must be in Year 9, 10, or 11 during the 2025/2026 academic year and attend a state-funded school in England; private, independent, and home-educated students are not eligible.",
    },
    prizes: {
      title: "🏆 The prizes",
      description: "As well as the glory of being a IOE innovator, we also have prizes available, which may include:",
      prizeList: [
        "Trophies for the winners",
        "£50 Amazon gift vouchers for the winners",
        "SOLIDWORKS CAD software licences for all finalists",
        "An exclusive industry tour hosted by a partner organisation for the winners",
        "Isaac Computer Science and partner merchandise for all finalists",
      ],
    },
    timeline: {
      title: "Competition Timeline",
      content:
        "Save the 2025/26 dates in your calendar and plan time for you or your team to develop your IoE idea before applications close.",
      entries: [
        { event: "Entries open", date: "November 2025" },
        { event: "Entries close", date: "31 January 2026" },
        { event: "Finalists selected", date: "March 2026" },
        { event: "The final", date: "18 May 2026" },
      ],
    },
  },
  accordion: {
    internetOfEverything: {
      title: "What is the Internet of Everything?",
      section: [
        "Imagine a world where everything around you is connected to the internet. Not just your phone or computer, but your watch, your shoes, your fridge, even your toothbrush! This is what we call the Internet of Everything.",
        "The IoE is like a giant invisible web that connects all things, people, data, and processes. It’s like a big team where everyone and everything works together, sharing information and making decisions.",
        "<strong>The IoE is made up of four main parts: people, things, data, and processes.</strong> When these parts work together, they can make our lives easier, safer, and more enjoyable.",

        "Real-life examples of IoE include:",
        [
          "smart homes: imagine your alarm clock wakes you up and then automatically tells your coffee maker to start brewing coffee",
          "wearable devices: devices like smartwatches can monitor your health, track your location if you’re lost, and even let you make phone calls or send messages",
          "smart cities: streetlights that turn off when it is light outside, or traffic lights that adjust based on road conditions",
          "connected cars: cars can communicate with each other to avoid accidents. They can also tell you when they need repairs or even call for help if there’s an emergency",
        ],
        "The Internet of Everything isn’t just about smart devices; it’s about connecting everything to make life easier, safer, and more enjoyable. It’s like a superpower that lets us make objects work together — but we must use this power responsibly and safely.",
      ],
    },
    projectIdeas: {
      title: "Project ideas to get started",
      section: [
        "There are endless possibilities! We know how challenging it can be to start with a blank page, so here are a few ideas to spark your creativity:",
        [
          "Develop an app or game that promotes healthy sleep habits",
          "Propose a device concept that helps keep public spaces clean",
          "Create a smart device for mental wellbeing",
        ],
        "These ideas are only the beginning – we can’t wait to see the innovative solutions you come up with!",
      ],
    },
    availableSupport: {
      title: "Available support",
      section: [
        "Explore our selection of resources to support your Internet of Everything (IoE) device design:",
        [
          "<a href='https://isaaccomputerscience.org/concepts/sys_arch_embed_sys'>Embedded Systems</a>",
          "<a href='https://isaaccomputerscience.org/concepts/sys_arch_processor'>The processor</a>",
          "<a href='https://isaaccomputerscience.org/concepts/sys_arch_performance'>Factors affecting processor performance</a>",
          "<a href='https://isaaccomputerscience.org/concepts/sys_arch_memory'>RAM: Main memory</a>",
          "<a href='https://isaaccomputerscience.org/concepts/net_network_wired_wireless'>Wired and Wireless networks</a>",
          "<a href='https://isaaccomputerscience.org/concepts/net_sec_threats'>Cybersecurity: Network threats</a>",
          "<a href='https://isaaccomputerscience.org/topics/legislation'>Legislation</a>",
          "<a href='https://isaaccomputerscience.org/topics/impacts_of_tech'>Impacts of technology</a>",
        ],
        "Check out our live booster sessions and discovery events <a href='https://isaaccomputerscience.org/events'>here</a> to enhance your subject knowledge and discover career opportunities in computer science.",
      ],
    },
    video: {
      title: "Video entry requirements",
      section: [
        "The competition entry should be submitted in video format of <strong>up to 5 minutes long.</strong> Any videos longer than 5 minutes will not be reviewed.",
        "<strong>Video content requirements:</strong>",
        [
          "<strong>Introduction:</strong> Introduce yourself or your team using the first names only and state the title of your project. Be creative and think about how you can make your introduction stand out!",
          "<strong>Overview of the project:</strong> Explain the global problem your IoE device addresses. Give a short summary of your project and its purpose.",
          "<strong>Impact:</strong> Describe how your IoE device could improve lives globally. Include any benefits for people, communities, or the environment.",
          "<strong>Device description:</strong> Show the design or prototype of your device – it doesn’t have to be perfect or finished! Explain its features, functions, and how it works.",
          "Teamwork or individual approach: <ul><li><strong>If it's a group project:</strong> Explain how you worked together, your collaboration skills, and methods used.</li><li><strong>If it's an individual project:</strong> Describe your approach, how you solved problems, and how you managed the project yourself.</li></ul>",
          "<strong>Creativity and engagement:</strong> Use visuals, demonstrations, or examples to make your video interesting and easy to follow. Creative formats are welcome! But make sure your explanation is clear for someone who has never seen your project before.",
        ],
        "Remember, the Internet of Everything (IoE) device focuses not just on things, but also on people, processes, and data. This captures the IoE difference from Internet of Things (IoT). IoT is mostly “things”; IoE is about integrating people, processes, and data with connected devices.",

        "<strong>Video technical requirements:</strong>",
        [
          "Not longer than 5 minutes.",
          "Recorded in a landscape mode if possible.",
          "Clear audio and video with good lighting.",
          "Recorded in one of the accepted formats such as MP4, MOV, AVI.",
          "Does not include inappropriate content, copyrighted music, or videos.",
          "If using a PowerPoint presentation for the video, a student(s) should record a voiceover.",
          "Name your file with your project name and entry title. For example: SmartLab_CompetitionEntry.mp4.",
          "The video and any additional supporting materials must be uploaded to a cloud storage folder (e.g., Google Drive, Dropbox) ensuring that it is accessible by the Organiser for the duration of the Competition.",
        ],
        "<strong>Supporting Documents</strong>",
        [
          "While not mandatory, supporting documents can enhance your submission.",
          "Consider including:<ul><li>Diagrams or sketches of your device.</li><li>A brief written summary of your project.</li><li>Evidence of research or data that supports your concept.</li><li>Reflections on collaboration and teamwork.</li></ul>",
        ],
        "<strong>Tips for Success</strong>",
        [
          "<strong>Identify a Global Challenge:</strong> Consider issues like climate change, health crises, education gaps, or social isolation.",
          "<strong>Innovative Design:</strong> Think creatively about how your device can uniquely address the problem.",
          "<strong>Collaboration Skills:</strong> Highlight how you worked together as a team, including communication, conflict resolution, and decision-making processes.",
          "<strong>Practice Your Presentation:</strong> Rehearse your video to ensure clarity and confidence.",
        ],
        "<strong>Resources:</strong>",
        [
          "<strong>Workshops:</strong> Attend any available workshops or information sessions to help refine your ideas. Check out our live booster events <a href='https://isaaccomputerscience.org/events'>here</a>.",
          "<strong>Online Resources:</strong> Explore websites and articles on IoE technology, design thinking, and teamwork strategies.",
          "<strong>Teacher Support:</strong> Work closely with your teacher to guide your project and provide insights.",
        ],
        "If you have any questions or run into problems, contact <a href='https://isaaccomputerscience.org/contact'>here</a>. Good luck — we can’t wait to see your video!",
      ],
    },
    groupEntry: {
      title: "How to create a group and submit your entry (for teachers)",
      section: [
        "<strong>How to create a group:</strong>",
        [
          "Only users with a teacher account can create a group. If you don’t have a teacher account, you can request one when signing up on the platform or through your student account settings. We aim to process all requests as quickly as possible, but it may take up to 5 working days. More information about teacher accounts is <a href = 'https://isaaccomputerscience.org/support/teacher/general'>here</a>.",
          "Click on ‘Teachers’ on the menu bar, then click on <a href = 'https://isaaccomputerscience.org/groups'>Manage groups</a> <ul><li>Enter a name for your new group. The group name will be shared with your students, so make it useful for them too.</li><li>For a student group entry, the Competition requires each group to consist of 2 to 4 students. If a student is working on the application individually, you may want to create a separate group for them.</li><li>Click on Create.</li></ul>",
          "You may use the existing group to enter students into the competition, as long as it includes everyone who worked on the project. Students from different groups on Isaac platform cannot be entered together.",
        ],
        "<strong>How to invite students to join a group:</strong>",
        [
          "To invite your students to join a group, click on the 'Invite Users' button on the <a href = 'https://isaaccomputerscience.org/groups'>Manage groups</a> page.",
          "Choose between a URL or an authentication code to share with the students.",
          "Find details about <a href='https://isaaccomputerscience.org/support/student/homework'>how students join groups here</a>. When students use the URL or code, they will be shown your first initial, last name, and email address, and they’ll be asked to confirm they want to share their progress with you.",
          "We recommend that you access your <a href='https://isaaccomputerscience.org/groups'>Manage groups</a> page when students first join your group to make sure that they’ve all verified their account email addresses before they log out.",
          "If a student does not appear in the group, it indicates that they have not joined the group.",
        ],
        "<strong>How to submit a Competition entry</strong>",
        [
          "Teachers are responsible for submitting the work of students on their behalf.",
          "Make sure that your account details are accurate in the <strong>‘Your account information’ section</strong> of the entry form. If necessary, you can update your information in your <a href = 'https://isaaccomputerscience.org/account'>account settings</a>.",
          "In the <strong>'Project title’ field,</strong> enter the title of the project your students worked on. Each title must be unique.",
          "In the <strong>‘Project link’ field,</strong> provide a link to the cloud storage where a video and any supporting materials are saved. Make sure the link is accessible to the Organiser by setting it to 'Anyone with the link can view'. If that's not possible, grant access to <a href='mailto:contact@isaaccomputerscience.org'>contact@isaaccomputerscience.org</a>.",
          "In the <strong>‘Select your student group’ field,</strong> choose from the groups you've created or create one first. If no groups are available, go to Teachers > <a href = 'https://isaaccomputerscience.org/groups'>Manage groups</a> to create one and invite students to join.",
          "In the <strong>‘Select student(s)’</strong> field, choose 1-4 students from your selected student group who worked on the submitted project. If no students are found in the selected group, make sure students join the group first. Go to the <a href = 'https://isaaccomputerscience.org/groups'>Manage groups</a> page and invite them using a URL or authentication code.",
        ],
        "If you have any questions or run into problems, contact <a href='https://isaaccomputerscience.org/contact'>here</a>.",
      ],
    },
    assessmentCriteria: {
      title: "Assessment criteria",
      section: [
        "When working on your project, don’t forget to consider all assessment criteria. Ask yourself the following questions:",
        "1. <strong>Internet of Everything (IOE) device:</strong>",
        [
          "<strong>Connectivity –</strong> Can the device connect to the internet or other devices so it can send and receive information automatically?",
          "<strong>People –</strong> Can the device help, interact with, or provide useful information to people?",
          "<strong>Things –</strong> Is the device or system something that can collect information, notice what’s happening, or take action?",
          "<strong>Data –</strong> Can the device collect, record, or generate information about itself, its surroundings, or its users?",
          "<strong>Processes –</strong> Does the device integrate with other systems, networks, or processes to improve efficiency, safety, or decisions?",
          "<strong>Value / Insights –</strong> Does the device provide useful insights or make life easier or better for people?",
        ],
        "",
        "2. <strong>Creativity and Originality:</strong>",
        [
          "Is the idea something new or different from what already exists?",
          "Does the project include creative features that make it stand out?",
          "Does the idea combine existing technologies in a new way?",
          "Does the project show creative problem-solving?",
        ],
        "",
        "3. <strong>Practicality and feasibility:</strong>",
        [
          "Is implementation realistic? Is it cost-effective?",
          "Is it scalable?",
          "Can the project be built using technology available today or soon?",
          "Would it work in the real world?",
          "Is it easy to maintain or update the device?",
        ],
        "",
        "4. <strong>Impact on society:</strong>",
        [
          "What big problem in the world does your project try to solve?",
          "Could it improve people’s lives?",
          "Could it help people in different countries or communities?",
        ],
        "",
        "5. <strong>Presentation quality:</strong>",
        [
          "Does the video clearly show the main problem the device solves?",
          "Does the video clearly show how your IoE device works?",
          "Does it use visuals to make it interesting?",
          "Is the video clear and easy to watch?",
          "Does the video explain why your idea is a good solution?",
        ],
      ],
    },
    industry: {
      title: "Industry partners",
      section: [
        "<strong>Birmingham City University</strong> is once again a key partner of the competition and will proudly host the <strong>final at their Innovation Fest in Birmingham this May.</strong> This event offers students and teachers an excellent chance to take part in an exciting showcase of creativity, innovation, and future talent.",
      ],
    },
    termsAndConditions: {
      title: "Terms and Conditions – 2025/26",
      section: [
        "The National Computer Science Competition (Competition) is run by the Department for Education’s National Centre for Computing Education (run by STEM Learning Limited (company number 05081097) hosted on the Isaac Computer Science platform (“Organiser”, “We” “Us” and “Our”), in partnership with the industry companies.",
        "“You” and “Your” refer to the Teacher(s) entering the Competition on behalf of a group of students or an individual student who meets the eligibility requirements.",
        "1.0 Introduction",
        [
          "1.1. By entering the Competition, you agree to abide by these Terms and Conditions. We reserve the right to refuse entry or award the prize to anyone in breach of these Terms and Conditions.",
          "1.2. “Student(s)” refers to the individual(s) in Years 9, 10, or 11, studying at a state-funded school in England and whose project is being submitted by teachers to enter the Competition.",
          "1.3, “Teacher(s)” refers to the individual(s) aged 18 or over who are employed by a state-funded school in England and have an active teacher account on the Isaac Computer Science platform. They will be responsible for submitting the work of students on their behalf and communicating with the Organiser.",
          "1.3. “Entry” refers to the Internet of Everything (IoE) product concept or prototype submission by the Student(s) in the format of a video presentation.",
          "1.4. “Prize” refers to the awards outlined on the Isaac Computer Science website, which may include a participation certificate, Amazon gift vouchers, industry tours, and other partner-sponsored rewards.",
          "1.5. “Finalist(s)” refers to the Student(s) selected to participate in the final event.",
          "1.6. “Winner(s)” refers to the Student(s) who wins the Competition.",
        ],
        "2.0 Eligibility",
        [
          "2.1. The Competition is open to students in Years 9, 10, or 11, attending state-funded schools in England. Groups must comprise of between 2 and 4 Students, assisted by a teacher. Submissions by individual students are permitted. For group entries, team members must all go to the same school but can be in different classes, forms, or years.",
          "2.2. Students attending private, independent, or home-education settings are not eligible to participate in the Competition.",
          "2.3. Each team should have a Teacher responsible for monitoring the team’s progress, available to offer help and advice, and acting as the point-of-contact between the Organiser and the Student(s) team. The Organiser will not be able to communicate directly with the Student(s).",
          "2.4. There is no entry fee, and no purchase is necessary to enter this Competition.",
          "2.5. Entries must be original and the sole work of the Student(s) participating.",
          "2.6. Entries must not infringe the intellectual property of any third party.",
          "2.7. By submitting an entry, you confirm that the Student(s) meet the eligibility requirements.",
          "2.8. By entering this Competition, you confirm that You have received parental consent of the Student(s) whose entry is entered into the Competition, and verbal assent from the Student(s) to enter the Competition under these Terms and Conditions.",
        ],
        "3.0 How to Enter",
        [
          "3.1. To enter the Competition: <ul><li>Teacher(s) and Student(s) register on the Isaac Computer Science platform or log in their existing account(s).</li><li>Teacher creates a group(s) on the Isaac Computer Science platform connecting the accounts of the Student(s) that are participating in the competition.</li><li>Student(s) works on a product concept or prototype demonstrating an IoE idea in the video format adhering to specified Entry requirements and Entry deadlines.</li><li>Teacher(s) submits a product concept or prototype demonstrating an IoE idea in the video format on behalf of a Student(s) or a group(s) of Students on the Isaac Computer Science platform.</li></ul>",
          "3.2. <strong>All entries must be received by 31 January 2026.</strong> Any entries received after this will not be considered.",
          "3.3. Only one entry per group or individual is allowed. Student(s) may submit one entry as an individual and one as part of a group, provided that each entry is a unique and original work with no overlap in content or materials between the two submissions.",
          "3.4. Teacher(s) must supervise each entry.",
          "3.5. Teacher(s) must ensure that all entries are following their school’s safeguarding policy.",
        ],
        "4.0 Entry Requirements",
        [
          "4.1. Student(s) must design a concept for an Internet of Everything (IoE) device aimed at improving the lives of a global society. Each entry must showcase the concept, including the design or prototype, along with any supporting documents if desired.",
          "4.2. The Entry must be submitted in video format of up to 5 minutes long. Any videos longer than 5 minutes will not be reviewed.",
          "4.3. Video content requirements: <ul><li>The video must introduce the team or an individual and give an overview of the project outlining the global problem addressed by the IoE device.</li><li>The video must describe the device and its features, showcasing a design or prototype.</li><li>The video must explain why the idea is unique and innovative.</li><li>If a group Entry is submitted, the video must discuss the collaboration skills and methods used when working on the project. In case of an individual Entry, a Student must explain their approach when working on the project.</li></ul>",
          "4.4. Student(s) are encouraged to include additional materials to support their video submission such as: <ul><li>Diagrams, sketches, or visual representations of the IoE device.</li><li>A concise written summary of the project.</li><li>Research data or evidence supporting the feasibility and impact of the concept.</li><li>Reflections on collaboration and teamwork during the project’s development.</li></ul>",
          "4.5. Video technical requirements: <ul><li>The video must be recorded in a landscape mode if possible.</li><li>The video must have clear audio and video with good lighting.</li><li>The video must be in one of the accepted formats such as MP4, MOV, AVI.</li><li>The video must not include inappropriate content, copyrighted music, or videos.</li><li>If using a PowerPoint presentation for the video, a Student(s) must record a voiceover.</li><li>The video and any additional supporting materials must be uploaded to a cloud storage folder (e.g., Google Drive, Dropbox) ensuring that it is accessible by the Organiser for the duration of the Competition.</li></ul>",
          "4.6. We do not accept entries: <ul><li>Automatically generated by computer or completed by third parties.</li><li>Without a video that is relevant to the topic and clearly narrated.</li></ul>",
        ],
        "5.0 Judging and Selection of Finalists",
        [
          "5.1. Finalists will be chosen from the highest scoring submissions against the following assessment criteria <ul><li>1. <strong>Creativity and Originality:</strong> (5 points max.) <ul><li>Innovativeness of the concept</li><li>Uniqueness of the idea.</li></ul> <li>2. <strong>Practicality and Feasibility:</strong> (5 points max.) <ul><li>Realistic implementation</li> <li>Technical feasibility.</li></ul></ul> <ul><li>3. <strong>Impact on Society:</strong> (5 points max) <ul><li>Potential to improve lives globally</li><li>Alignment with the theme.</li></ul></ul><ul><li>4. <strong>Presentation Quality:</strong> (5 points max.) <ul><li>Clarity and organization</li><li> Engagement and communication skills.</li></ul></ul>",
          "5.2. Finalists will be selected by a judging panel comprising of the Organiser representatives and industry professionals. The judges’ decisions are final, and no appeals can be made regarding the results.",
          "5.3. Finalists will be invited to present their projects at the final event.<strong> The final event is proposed to be held during the Innovation Fest in May 2026 in Birmingham. </strong> The exact details of the final will be shared with the Finalists.",
          "5.4. Finalists judged to be the Winners of the competition will receive prizes, which may include a participation certificate, Amazon gift vouchers, industry tours, and other partner-sponsored rewards.",
          "5.5. If Student(s) are selected as Finalist(s), Teacher must confirm participation in the final within one week of notification. In the event of delayed response or inability to attend, We reserve the right to offer the place to an alternative entry.",
          "5.6. We will publish the names of the winning school(s) and project details on Our websites and social media.",
        ],
        "6.0 Final",
        [
          "6.1. The final will be a one-day event consisting of presentations, talks and workshops from industry representatives, as well as final presentations of the IoE device concepts and prototypes from the Competition Finalists.",
          "6.2. Finalists of the Competition will be invited to a final event to present a concept or prototype of their IoE device in person. Finalists will be required to submit a device presentation ahead of the final. The exact date and location to be confirmed to the Finalists later.",
          "6.3. The Winners will be decided on by a judging panel appointed by the Organiser and announced during the final event.",
          "6.4. The school of the Finalist(s) will be responsible for travel arrangements and will pay for transport to and from the final event the Student(s) was invited to. Provision may be available for those who find difficulties in reaching the final.",
          "6.5. Student(s) must be accompanied by school staff who must hold a valid DBS certificate and obtain consent forms from the Students’ parents or guardians.",
        ],
        "7.0 Prizes",
        [
          "7.1. All Finalists will receive a certificate of participation, and all Winners will receive a certificate of achievement for winning the Competition.",
          "7.2. Additional Prizes for Winners may include, but subject to change: <ul><li>£50 Amazon gift vouchers</li><li>Isaac Computer Science merchandise, such as poster, notebook, bottle, and pen</li><li>Industry tours from partner organisations</li></ul>",
          "7.3. Prizes will be shared between the Students in a group.",
          "7.4. The Winner accepts and agrees that: <ul><li>The Prize must be taken as stated, it is non-transferable, and cannot be deferred, exchanged, or redeemed for its value.</li><li>No alternative to the Prize will be available.</li><li>Our decision is final and binding and no correspondence will be entered into about it.</li><li>All Prizes will be given to the Teacher who submitted the winning Entry and it is their responsibility to ensure the Prize is given to the Student(s).</li></ul>",
        ],
        "8. Rights and Permissions",
        [
          "8.1. By entering, you grant the Organiser and its partners a non-exclusive, perpetual, royalty-free license to use the entry material for promotional purposes of the Competition.",
          "8.2. Finalists and Winners may be asked to participate in additional promotional activities, including media coverage.",
          "8.2.1. We may announce the Winners via: STEM Learning, National Centre for Computing Education and Isaac Computer Science websites and social media channels, email correspondence, and other relevant third parties involved in the Competition.",
          "8.3. Any Entry found to have infringed third-party intellectual property rights or to have been automatically generated by computer will be withdrawn from the Competition.",
          "8.4. The intellectual property rights of the submitted work remain with the Student(s) who submitted the Entry.",
          "8.5. Student(s) taking part in the Competition agree to allow the Organiser and its partners to retain the exclusive right to use their entry online, in marketing, media and public display to promote the Competition free of charge and with no time limit.",
          "8.6. Entrants and participating schools will be credited where feasible, but Isaac Computer Science reserves the right to use the submissions without attribution if necessary.",
          "8.7. By entering, you confirm that the submission is original and does not infringe upon any third-party intellectual property rights.",
        ],
        "9. Liability",
        [
          "9.1. We are not responsible for any technical errors or other issues that may prevent entries from being submitted or considered.",
          "9.2. We do not accept responsibility for system errors or other issues that may result in disruption to, lost, delayed, or not received entries, winner notifications, or prizes.",
          "9.3. If the Competition cannot proceed due to unforeseen circumstances, We reserve the right to amend, suspend, or cancel it.",
          "9.4. If an act, omission, event, or circumstance occurs which are beyond Our reasonable control and which prevents Us from complying with these terms and conditions, We will not be liable for any failure to perform or delay in performing Our obligation.",
          "9.5. We shall not be liable for any costs associated with participating in the Competition.",
          "9.6. We may review and revise these terms and conditions at any time without giving prior notice.",
        ],
        "10. Data Protection",
        [
          "10.1. We will only process personal data in accordance with Our <a href='https://isaaccomputerscience.org/privacy?examBoard=all&stage=all'>Privacy Policy</a> and Competition terms.",
          "10.2. Student(s)’s first names and school names may be used in publicity associated with the Competition.",
        ],
        "11. General",
        [
          "11.1. If there is any reason to believe that there has been a breach of these terms and conditions, We may, at Our sole discretion, reserve the right to exclude You from participating in the Competition.",
          "11.2. We reserve the right to hold void, suspend, cancel, or amend the Competition and/or Prize where it becomes necessary to do so.",
          "11.3. These Terms and Conditions are governed by English law, and any disputes will be subject to the jurisdiction of the English courts.",
        ],
      ],
    },
  },
};
