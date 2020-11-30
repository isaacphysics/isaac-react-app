import {TAG_ID, TAG_LEVEL} from "./constants";
import {BaseTag} from "../../IsaacAppTypes";
import {ContentDTO} from "../../IsaacApiTypes";
import subject from "./subject";
import {AbstractBaseTagService} from "./tagsAbstract";

export class PhysicsTagService extends AbstractBaseTagService {
    private static readonly tagHierarchy = [TAG_LEVEL.subject, TAG_LEVEL.field, TAG_LEVEL.topic];
    private static readonly baseTags: BaseTag[] = [
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
        {id: TAG_ID.angularMotion, title: "Angular Motion", parent: TAG_ID.mechanics},
        {id: TAG_ID.circularMotion, title: "Circular Motion", parent: TAG_ID.mechanics},
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
        {id: TAG_ID.complex_numbers, title: "Complex Numbers", parent: TAG_ID.algebra},
        // Functions topics
        {id: TAG_ID.generalFunctions, title: "General Functions", parent: TAG_ID.functions},
        {id: TAG_ID.graphSketching, title: "Graph Sketching", parent: TAG_ID.functions},
    ];
    public getTagHierarchy() {return PhysicsTagService.tagHierarchy;}
    public getBaseTags() {return PhysicsTagService.baseTags;}
    public augmentDocWithSubject(doc: ContentDTO) {
        const documentSubject = this.getPageSubjectTag((doc.tags || []) as TAG_ID[]);
        return Object.assign(doc, {subjectId: documentSubject ? documentSubject.id
            : TAG_ID.physics});
    }

    private getPageSubjectTag(tagArray: TAG_ID[]) {
        // Extract the subject tag from a tag array,
        // defaulting to the current site subject if no tags
        // and intelligently choosing if more than one subject tag.
        const globalSubjectTagId = subject.id;
        if (tagArray == null || tagArray.length == 0) {
            return this.getById(globalSubjectTagId as TAG_ID);
        }

        const subjectTags = this.getSpecifiedTags(TAG_LEVEL.subject, tagArray);
        for (const i in subjectTags) {
            if (subjectTags[i].id == globalSubjectTagId) {
                return subjectTags[i];
            }
        }
        return subjectTags[0];
    }
}


