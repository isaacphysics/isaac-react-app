import {TAG_ID, TAG_LEVEL} from "./constants";
import {BaseTag} from "../../IsaacAppTypes";
import {ContentDTO} from "../../IsaacApiTypes";
import subject from "./subject";
import {AbstractBaseTagService} from "./tagsAbstract";

const softHyphen = "\u00AD";

export class PhysicsTagService extends AbstractBaseTagService {
    private static readonly tagHierarchy = [TAG_LEVEL.subject, TAG_LEVEL.field, TAG_LEVEL.topic];
    private static readonly baseTags: BaseTag[] = [
        // Subjects
        {id: TAG_ID.physics, trustedTitle: "Physics"},
        {id: TAG_ID.maths, trustedTitle: "Maths"},
        {id: TAG_ID.chemistry, trustedTitle: "Chemistry"},

        // Physics fields
        {id: TAG_ID.mechanics, trustedTitle: "Mechanics", parent: TAG_ID.physics},
        {id: TAG_ID.waves, trustedTitle: "Waves", parent: TAG_ID.physics},
        {id: TAG_ID.fields, trustedTitle: "Fields", parent: TAG_ID.physics},
        {id: TAG_ID.circuits, trustedTitle: "Circuits", parent: TAG_ID.physics},
        // Mechanics topics
        {id: TAG_ID.statics, trustedTitle: "Statics", parent: TAG_ID.mechanics},
        {id: TAG_ID.dynamics, trustedTitle: "Dynamics", parent: TAG_ID.mechanics},
        {id: TAG_ID.shm, trustedTitle: "SHM", parent: TAG_ID.mechanics},
        {id: TAG_ID.angularMotion, trustedTitle: "Angular Motion", parent: TAG_ID.mechanics},
        {id: TAG_ID.circularMotion, trustedTitle: "Circular Motion", parent: TAG_ID.mechanics},
        {id: TAG_ID.kinematics, trustedTitle: `Kine${softHyphen}matics`, parent: TAG_ID.mechanics},
        // Fields topics
        {id: TAG_ID.electric, trustedTitle: "Electric Fields", parent: TAG_ID.fields},
        {id: TAG_ID.magnetic, trustedTitle: "Magnetic Fields", parent: TAG_ID.fields},
        {id: TAG_ID.gravitational, trustedTitle: `Gravi${softHyphen}tational Fields`, parent: TAG_ID.fields},
        {id: TAG_ID.combined, trustedTitle: "Combined Fields", parent: TAG_ID.fields},
        // Circuits topics
        {id: TAG_ID.resistors, trustedTitle: "Resistors", parent: TAG_ID.circuits},
        {id: TAG_ID.capacitors, trustedTitle: "Capacitors", parent: TAG_ID.circuits},
        {id: TAG_ID.generalCircuits, trustedTitle: "General Circuits",  parent: TAG_ID.circuits},
        // Waves topics:
        {id: TAG_ID.optics, trustedTitle: `Optics`, parent: TAG_ID.waves},
        {id: TAG_ID.superposition, trustedTitle: `Super${softHyphen}position`, parent: TAG_ID.waves},
        {id: TAG_ID.waveMotion, trustedTitle: "Wave Motion", parent: TAG_ID.waves},

        // Maths fields
        {id: TAG_ID.geometry, trustedTitle: "Geometry", parent: TAG_ID.maths},
        {id: TAG_ID.calculus, trustedTitle: "Calculus", parent: TAG_ID.maths},
        {id: TAG_ID.algebra, trustedTitle: "Algebra", parent: TAG_ID.maths},
        {id: TAG_ID.functions, trustedTitle: "Functions", parent: TAG_ID.maths},
        // Geometry topics
        {id: TAG_ID.geomVectors, trustedTitle: "Vectors", parent: TAG_ID.geometry},
        {id: TAG_ID.trigonometry, trustedTitle: `Trigon${softHyphen}ometry`, parent: TAG_ID.geometry},
        {id: TAG_ID.shapes, trustedTitle: "Shapes", parent: TAG_ID.geometry},
        // Calculus topics
        {id: TAG_ID.differentiation, trustedTitle: `Differen${softHyphen}tiation`, parent: TAG_ID.calculus},
        {id: TAG_ID.integration, trustedTitle: "Integration", parent: TAG_ID.calculus},
        {id: TAG_ID.differentialEq, trustedTitle: "Differential Equations", parent: TAG_ID.calculus},
        // Algebra topics
        {id: TAG_ID.simultaneous, trustedTitle: `Simul${softHyphen}taneous Equations`, parent: TAG_ID.algebra},
        {id: TAG_ID.quadratics, trustedTitle: "Quadratics", parent: TAG_ID.algebra},
        {id: TAG_ID.manipulation, trustedTitle: `Manip${softHyphen}ulation`, parent: TAG_ID.algebra},
        {id: TAG_ID.series, trustedTitle: "Series", parent: TAG_ID.algebra},
        {id: TAG_ID.complex_numbers, trustedTitle: "Complex Numbers", parent: TAG_ID.algebra},
        // Functions topics
        {id: TAG_ID.generalFunctions, trustedTitle: "General Functions", parent: TAG_ID.functions},
        {id: TAG_ID.graphSketching, trustedTitle: "Graph Sketching", parent: TAG_ID.functions},

        // Chemistry fields
        {id: TAG_ID.chemPhysics, trustedTitle: "Physical Chemistry", parent: TAG_ID.chemistry},
        // Physical Chemistry topics:
        {id: TAG_ID.thermodynamics, trustedTitle: `Thermo${softHyphen}dynamics`, parent: TAG_ID.chemPhysics},
        {id: TAG_ID.kinetics, trustedTitle: "Reaction Kinetics", parent: TAG_ID.chemPhysics},
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


