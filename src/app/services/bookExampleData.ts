import {ContentDTO, ImageDTO, SeguePageDTO} from "../../IsaacApiTypes";

export interface BookSectionDTO extends ContentDTO {
    label?: string;
    pageId?: string;
}

export interface BookChapterDTO extends ContentDTO {
    label?: string;
    sections?: BookSectionDTO[];
}

export interface IsaacBookIndexPageDTO extends SeguePageDTO {
    chapters?: BookChapterDTO[];
    coverImage?: ImageDTO;
}


export const physicsSkills19: IsaacBookIndexPageDTO = {
    "type": "isaacBookIndexPage",
    "id": "book_physics_skills_19",
    "title": "Mastering Essential Pre-University Physics",
    "subtitle": "",
    "tags": [
        "physics"
    ],
    "coverImage": {
        "src": "/assets/phy/books/physics_skills_19.jpg",
        "type": "image",
        "altText": "",
        "id": "physics_skills_19_cover"
    },
    "value": "##### By A. C. Machacek and J. J. Crowter\n\n##### These exercises help students practise applying the concepts of Sixth Form physics.\n\n\n<br>\n_This is the 3rd and current edition. The 2nd edition of this book is now deprecated. To see the [2nd edition home page, click here](/books/physics_skills_14). The 3rd edition book has a light purple stripe down the side._\n<br>\n\n\n#### Lessons for remote learning\n\nVirtual lessons following the Essential Pre-University Physics book. \n\n<a class=\"button btn btn-green\" href=\"/pages/a_level_topic_index\">Virtual lessons by topic</a>\n\n#### Buy the book\n\nPrinted copies of the book are available at cost price £1.50 (plus p+p) from <a href=\"http://www.isaacbooks.org\"><b>isaacbooks.org</b></a>.\n\n<a class=\"button btn btn-green\" href=\"http://www.isaacbooks.org\" target=\"_blank\">Buy Isaac Books</a>\n\n### For Teachers\n\n##### <a href=\"/pages/syllabus_map_19\" target=\"_blank\"><b>Specification Table</b></a> - maps the book to your exam board.\n\n##### <a href=\"/pages/guidance_notes_mepup\" target=\"_blank\"><b>Teacher Guidance Notes</b></a> - by A. Machacek.\n\n##### **Set a section for homework**\nEither click \"Assign\" below, or the section number in the specification table.\n\n* You will be taken to your \"Set Assignments\" page where the section will appear in the top left position. Click on \"Assign / Unassign\" to see a drop down list of your groups.\n* Click on the group name and \"Save\" to assign it.",
    "chapters": [
        {
            "type": "bookChapter",
            "title": "General Questions",
            "id": "ch_a",
            "label": "A",
            "sections": [
                {
                    "type": "bookSection",
                    "title": "Using and Rearranging Equations",
                    "label": "A1",
                    "pageId": "phys19_section_a1"
                },
                {
                    "type": "bookSection",
                    "title": "Derived and Base SI Units",
                    "label": "A2",
                    "pageId": "phys19_section_a2_r1"
                },
                {
                    "type": "bookSection",
                    "title": "Standard Form and Prefixes",
                    "label": "A3",
                    "pageId": "phys19_section_a3_r1"
                },
                {
                    "type": "bookSection",
                    "title": "Converting Units",
                    "label": "A4",
                    "pageId": "phys19_section_a4"
                },
                {
                    "type": "bookSection",
                    "title": "Gradients and Intercepts of Graphs",
                    "label": "A5",
                    "pageId": "phys19_section_a5"
                },
                {
                    "type": "bookSection",
                    "title": "Equations of Graphs",
                    "label": "A6",
                    "pageId": "phys19_section_a6"
                },
                {
                    "type": "bookSection",
                    "title": "Area Under the Line on a Graph",
                    "label": "A7",
                    "pageId": "phys19_section_a7"
                },
                {
                    "type": "bookSection",
                    "title": "Area Under the Line on a Graph II",
                    "label": "A8",
                    "pageId": "phys19_section_a8"
                },
                {
                    "type": "bookSection",
                    "title": "Factor and Percentage Changes",
                    "label": "A9",
                    "pageId": "phys19_section_a9"
                },
                {
                    "type": "bookSection",
                    "title": "Proportionality",
                    "label": "A10",
                    "pageId": "phys19_section_a10"
                }
            ]
        },
        {
            "type": "bookChapter",
            "title": "Mechanics",
            "id": "ch_b",
            "label": "B",
            "sections": [
                {
                    "type": "bookSection",
                    "title": "Components of a Vector",
                    "label": "B1",
                    "pageId": "phys19_section_b1"
                },
                {
                    "type": "bookSection",
                    "title": "Adding Vectors",
                    "label": "B2",
                    "pageId": "phys19_section_b2"
                },
                {
                    "type": "bookSection",
                    "title": "Uniform Accelerated Motion in 1-d",
                    "label": "B3",
                    "pageId": "phys19_section_b3"
                },
                {
                    "type": "bookSection",
                    "title": "Trajectories",
                    "label": "B4",
                    "pageId": "phys19_section_b4"
                },
                {
                    "type": "bookSection",
                    "title": "Moments",
                    "label": "B5",
                    "pageId": "phys19_section_b5"
                },
                {
                    "type": "bookSection",
                    "title": "Stress, Strain and Young's Modulus",
                    "label": "B6",
                    "pageId": "phys19_section_b6"
                },
                {
                    "type": "bookSection",
                    "title": "Springs",
                    "label": "B7",
                    "pageId": "phys19_section_b7"
                },
                {
                    "type": "bookSection",
                    "title": "Work, Energy and Power",
                    "label": "B8",
                    "pageId": "phys19_section_b8"
                },
                {
                    "type": "bookSection",
                    "title": "Energy, Springs and Materials",
                    "label": "B9",
                    "pageId": "phys19_section_b9"
                }
            ]
        },
        {
            "type": "bookChapter",
            "title": "Electric Circuits",
            "id": "ch_c",
            "label": "C",
            "sections": [
                {
                    "type": "bookSection",
                    "title": "Combinations of Resistors",
                    "label": "C1",
                    "pageId": "phys19_section_c1"
                },
                {
                    "type": "bookSection",
                    "title": "Charge Carriers",
                    "label": "C2",
                    "pageId": "phys19_section_c2"
                },
                {
                    "type": "bookSection",
                    "title": "Charge Carriers II",
                    "label": "C3",
                    "pageId": "phys19_section_c3"
                },
                {
                    "type": "bookSection",
                    "title": "Kirchhoff's Laws",
                    "label": "C4",
                    "pageId": "phys19_section_c4"
                },
                {
                    "type": "bookSection",
                    "title": "Potential Dividers",
                    "label": "C5",
                    "pageId": "phys19_section_c5"
                },
                {
                    "type": "bookSection",
                    "title": "Internal Resistance",
                    "label": "C6",
                    "pageId": "phys19_section_c6"
                }
            ]
        },
        {
            "type": "bookChapter",
            "title": "Waves",
            "id": "ch_d",
            "label": "D",
            "sections": [
                {
                    "type": "bookSection",
                    "title": "Amplitude and Intensity",
                    "label": "D1",
                    "pageId": "phys19_section_d1"
                },
                {
                    "type": "bookSection",
                    "title": "Polarisation",
                    "label": "D2",
                    "pageId": "phys19_section_d2"
                },
                {
                    "type": "bookSection",
                    "title": "Path Difference",
                    "label": "D3",
                    "pageId": "phys19_section_d3"
                },
                {
                    "type": "bookSection",
                    "title": "Interference",
                    "label": "D4",
                    "pageId": "phys19_section_d4"
                },
                {
                    "type": "bookSection",
                    "title": "Standing Waves",
                    "label": "D5",
                    "pageId": "phys19_section_d5"
                },
                {
                    "type": "bookSection",
                    "title": "The Photoelectric Effect",
                    "label": "D6",
                    "pageId": "phys19_section_d6"
                },
                {
                    "type": "bookSection",
                    "title": "Quantum Calculations",
                    "label": "D7",
                    "pageId": "phys19_section_d7"
                },
                {
                    "type": "bookSection",
                    "title": "Refraction and Total Internal Reflection",
                    "label": "D8",
                    "pageId": "phys19_section_d8"
                },
                {
                    "type": "bookSection",
                    "title": "Energy Levels",
                    "label": "D9",
                    "pageId": "phys19_section_d9"
                }
            ]
        },
        {
            "type": "bookChapter",
            "title": "Uncertainties",
            "id": "ch_e",
            "label": "E",
            "sections": [
                {
                    "type": "bookSection",
                    "title": "Absolute Uncertainties",
                    "label": "E1",
                    "pageId": "phys19_section_e1"
                },
                {
                    "type": "bookSection",
                    "title": "Relative Uncertainties",
                    "label": "E2",
                    "pageId": "phys19_section_e2"
                },
                {
                    "type": "bookSection",
                    "title": "Propagating Uncertainties",
                    "label": "E3",
                    "pageId": "phys19_section_e3"
                },
                {
                    "type": "bookSection",
                    "title": "Accuracy, Percentage Difference and Reliability",
                    "label": "E4",
                    "pageId": "phys19_section_e4"
                }
            ]
        },
        {
            "type": "bookChapter",
            "title": "Mechanics",
            "id": "ch_f",
            "label": "F",
            "sections": [
                {
                    "type": "bookSection",
                    "title": "Force and Momentum",
                    "label": "F1",
                    "pageId": "phys19_section_f1"
                },
                {
                    "type": "bookSection",
                    "title": "Conservation of Momentum",
                    "label": "F2",
                    "pageId": "phys19_section_f2"
                },
                {
                    "type": "bookSection",
                    "title": "Units of Rotary Motion",
                    "label": "F3",
                    "pageId": "phys19_section_f3"
                },
                {
                    "type": "bookSection",
                    "title": "Centripetal Acceleration",
                    "label": "F4",
                    "pageId": "phys19_section_f4"
                },
                {
                    "type": "bookSection",
                    "title": "Newtonian Gravity",
                    "label": "F5",
                    "pageId": "phys19_section_f5"
                },
                {
                    "type": "bookSection",
                    "title": "Gravity and Orbits",
                    "label": "F6",
                    "pageId": "phys19_section_f6"
                },
                {
                    "type": "bookSection",
                    "title": "Oscillators",
                    "label": "F7",
                    "pageId": "phys19_section_f7"
                }
            ]
        },
        {
            "type": "bookChapter",
            "title": "Gases and Thermal Physics",
            "id": "ch_g",
            "label": "G",
            "sections": [
                {
                    "type": "bookSection",
                    "title": "Kelvin Scale of Temperature",
                    "label": "G1",
                    "pageId": "phys19_section_g1"
                },
                {
                    "type": "bookSection",
                    "title": "Gas Laws",
                    "label": "G2",
                    "pageId": "phys19_section_g2"
                },
                {
                    "type": "bookSection",
                    "title": "Heat Capacity",
                    "label": "G3",
                    "pageId": "phys19_section_g3"
                },
                {
                    "type": "bookSection",
                    "title": "Latent Heat and Heat Capacity",
                    "label": "G4",
                    "pageId": "phys19_section_g4"
                }
            ]
        },
        {
            "type": "bookChapter",
            "title": "Fields",
            "id": "ch_h",
            "label": "H",
            "sections": [
                {
                    "type": "bookSection",
                    "title": "Uniform Electric Fields",
                    "label": "H1",
                    "pageId": "phys19_section_h1"
                },
                {
                    "type": "bookSection",
                    "title": "Electric Field Near Point Charges",
                    "label": "H2",
                    "pageId": "phys19_section_h2"
                },
                {
                    "type": "bookSection",
                    "title": "Speed of Electron in an Electric Field",
                    "label": "H3",
                    "pageId": "phys19_section_h3"
                },
                {
                    "type": "bookSection",
                    "title": "Force on a Conductor in a Magnetic Field",
                    "label": "H4",
                    "pageId": "phys19_section_h4"
                },
                {
                    "type": "bookSection",
                    "title": "Force on a Particle in a Magnetic Field",
                    "label": "H5",
                    "pageId": "phys19_section_h5"
                },
                {
                    "type": "bookSection",
                    "title": "Circular Paths of Particles in Magnetic Fields",
                    "label": "H6",
                    "pageId": "phys19_section_h6"
                },
                {
                    "type": "bookSection",
                    "title": "Magnetic Flux and Faraday's Law",
                    "label": "H7",
                    "pageId": "phys19_section_h7"
                },
                {
                    "type": "bookSection",
                    "title": "Transformers",
                    "label": "H8",
                    "pageId": "phys19_section_h8"
                },
                {
                    "type": "bookSection",
                    "title": "Energies and Potentials of Charges in Electric Fields",
                    "label": "H9",
                    "pageId": "phys19_section_h9"
                }
            ]
        },
        {
            "type": "bookChapter",
            "title": "Capacitors",
            "id": "ch_i",
            "label": "I",
            "sections": [
                {
                    "type": "bookSection",
                    "title": "Charge and Energy Stored on a Capacitor",
                    "label": "I1",
                    "pageId": "phys19_section_i1"
                },
                {
                    "type": "bookSection",
                    "title": "Capacitor Networks",
                    "label": "I2",
                    "pageId": "phys19_section_i2"
                },
                {
                    "type": "bookSection",
                    "title": "Discharge of a Capacitor",
                    "label": "I3",
                    "pageId": "phys19_section_i3"
                }
            ]
        },
        {
            "type": "bookChapter",
            "title": "Nuclear Physics",
            "id": "ch_j",
            "label": "J",
            "sections": [
                {
                    "type": "bookSection",
                    "title": "Nuclear Equations",
                    "label": "J1",
                    "pageId": "phys19_section_j1"
                },
                {
                    "type": "bookSection",
                    "title": "Activity and Decay",
                    "label": "J2",
                    "pageId": "phys19_section_j2"
                },
                {
                    "type": "bookSection",
                    "title": "Nuclear Decay with Time",
                    "label": "J3",
                    "pageId": "phys19_section_j3"
                },
                {
                    "type": "bookSection",
                    "title": "Energy in Nuclear Reactions",
                    "label": "J4",
                    "pageId": "phys19_section_j4"
                }
            ]
        },
        {
            "type": "bookChapter",
            "title": "Modelling the Universe",
            "id": "ch_k",
            "label": "K",
            "sections": [
                {
                    "type": "bookSection",
                    "title": "Red Shift and Hubble's Law",
                    "label": "K1",
                    "pageId": "phys19_section_k1"
                },
                {
                    "type": "bookSection",
                    "title": "Exponential Extrapolation",
                    "label": "K2",
                    "pageId": "phys19_section_k2"
                },
                {
                    "type": "bookSection",
                    "title": "Black-Body Radiation",
                    "label": "K3",
                    "pageId": "phys19_section_k3"
                }
            ]
        },
        {
            "type": "bookChapter",
            "title": "Fact Sheets",
            "id": "ch_l",
            "label": "L",
            "sections": [
                {
                    "type": "bookSection",
                    "title": "Mass Spectrometers",
                    "label": "L1",
                    "pageId": "phys19_section_l1"
                },
                {
                    "type": "bookSection",
                    "title": "Fundamental Particles and Interactions",
                    "label": "L2",
                    "pageId": "phys19_section_l2"
                },
                {
                    "type": "bookSection",
                    "title": "Nuclear Reactors",
                    "label": "L3",
                    "pageId": "phys19_section_l3"
                },
                {
                    "type": "bookSection",
                    "title": "X-Rays",
                    "label": "L4",
                    "pageId": "phys19_section_l4"
                },
                {
                    "type": "bookSection",
                    "title": "Ultrasound",
                    "label": "L5",
                    "pageId": "phys19_section_l5"
                },
                {
                    "type": "bookSection",
                    "title": "MRI and PET Scanning",
                    "label": "L6",
                    "pageId": "phys19_section_l6"
                },
                {
                    "type": "bookSection",
                    "title": "Stars",
                    "label": "L7",
                    "pageId": "phys19_section_l7"
                },
                {
                    "type": "bookSection",
                    "title": "The History of the Universe",
                    "label": "L8",
                    "pageId": "phys19_section_l8"
                }
            ]
        }
    ]
};
