import {TAG_ID, TAG_LEVEL} from "./constants";
import {BaseTag} from "../../IsaacAppTypes";

export const tagHierarchy = [TAG_LEVEL.category, TAG_LEVEL.subcategory, TAG_LEVEL.topic];

export const baseTags: BaseTag[] = [
    // Subjects
    {id: TAG_ID.physics, title: "Physics"},
    {id: TAG_ID.maths, title: "Maths"},
    {id: TAG_ID.chemistry, title: "Chemistry"},

    // Physics fields
    {id: TAG_ID.mechanics, title: "Mechanics", parent: TAG_ID.physics},
    {id: TAG_ID.waves, title: "Waves", parent: TAG_ID.physics},
    {id: TAG_ID.fields, title: "Fields", parent: TAG_ID.physics},
    {id: TAG_ID.circuits, title: "Circuits", parent: TAG_ID.physics},
    {id: TAG_ID.chemPhysics, title: "Physical Chemistry", parent: TAG_ID.physics},
    // Mechanics topics
    {id: TAG_ID.statics, title: "Statics", parent: TAG_ID.mechanics},
    {id: TAG_ID.dynamics, title: "Dynamics", parent: TAG_ID.mechanics},
    {id: TAG_ID.shm, title: "SHM", parent: TAG_ID.mechanics},
    {id: TAG_ID.angularMotion, title: "Angular_motion", parent: TAG_ID.mechanics},
    {id: TAG_ID.circularMotion, title: "Circular_motion", parent: TAG_ID.mechanics},
    {id: TAG_ID.kinematics, title: "Kinematics", parent: TAG_ID.mechanics},
    // Fields topics
    {id: TAG_ID.electric, title: "Electric Fields", parent: TAG_ID.fields},
    {id: TAG_ID.magnetic, title: "Magnetic Fields", parent: TAG_ID.fields},
    {id: TAG_ID.gravitational, title: "Gravitational Fields", parent: TAG_ID.fields},
    {id: TAG_ID.combined, title: "Combined Fields", parent: TAG_ID.fields},
    // Circuits topics
    {id: TAG_ID.resistors, title: "Resistors", parent: TAG_ID.circuits},
    {id: TAG_ID.capacitors, title: "Capacitors", parent: TAG_ID.circuits},
    {id: TAG_ID.generalCircuits, title: "General Circuits",  parent: TAG_ID.circuits},
    // Waves topics:
    {id: TAG_ID.optics, title: "Optics", parent: TAG_ID.waves},
    {id: TAG_ID.superposition, title: "Superposition", parent: TAG_ID.waves},
    {id: TAG_ID.waveMotion, title: "Wave Motion", parent: TAG_ID.waves},
    // Physical Chemistry topics:
    {id: TAG_ID.thermodynamics, title: "Thermodynamics", parent: TAG_ID.chemPhysics},
    {id: TAG_ID.kinetics, title: "Reaction Kinetics", parent: TAG_ID.chemPhysics},

    // Maths fields
    {id: TAG_ID.geometry, title: "Geometry", parent: TAG_ID.maths},
    {id: TAG_ID.calculus, title: "Calculus", parent: TAG_ID.maths},
    {id: TAG_ID.algebra, title: "Algebra", parent: TAG_ID.maths},
    {id: TAG_ID.functions, title: "Functions", parent: TAG_ID.maths},
    // Geometry topics
    {id: TAG_ID.geomVectors, title: "Vectors", parent: TAG_ID.geometry},
    {id: TAG_ID.trigonometry, title: "Trigonometry", parent: TAG_ID.geometry},
    {id: TAG_ID.shapes, title: "Shapes", parent: TAG_ID.geometry},
    // Calculus topics
    {id: TAG_ID.differentiation, title: "Differentiation", parent: TAG_ID.calculus},
    {id: TAG_ID.integration, title: "Integration", parent: TAG_ID.calculus},
    {id: TAG_ID.differentialEq, title: "Differential Equations", parent: TAG_ID.calculus},
    // Algebra topics
    {id: TAG_ID.simultaneous, title: "Simultaneous Equations", parent: TAG_ID.algebra},
    {id: TAG_ID.quadratics, title: "Quadratics", parent: TAG_ID.algebra},
    {id: TAG_ID.manipulation, title: "Manipulation", parent: TAG_ID.algebra},
    {id: TAG_ID.series, title: "Series", parent: TAG_ID.algebra},
    // Functions topics
    {id: TAG_ID.generalFunctions, title: "General_functions", parent: TAG_ID.functions},
    {id: TAG_ID.graphSketching, title: "Graph_sketching", parent: TAG_ID.functions},
];
