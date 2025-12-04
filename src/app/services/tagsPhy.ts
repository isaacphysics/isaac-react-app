import {AbstractBaseTagService, getTagFromPath, TAG_ID, TAG_LEVEL} from "./";
import {BaseTag, Tag} from "../../IsaacAppTypes";
import {ContentDTO, ContentSummaryDTO} from "../../IsaacApiTypes";

export const softHyphen = "\u00AD";

export class PhysicsTagService extends AbstractBaseTagService {
    private static readonly tagHierarchy = [TAG_LEVEL.subject, TAG_LEVEL.field, TAG_LEVEL.topic];
    private static readonly baseTags: BaseTag[] = [
        // --- Subjects ---
        {id: TAG_ID.physics, title: "Physics"},
        {id: TAG_ID.maths, title: "Maths"},
        {id: TAG_ID.chemistry, title: "Chemistry"},
        {id: TAG_ID.biology, title: "Biology"},

        // --- Fields ---

        // Physics Fields
        {id: TAG_ID.skills, title: "Skills", parent: TAG_ID.physics},
        {id: TAG_ID.mechanics, title: "Mechanics", parent: TAG_ID.physics},
        {id: TAG_ID.electricity, title: "Electricity", parent: TAG_ID.physics},
        {id: TAG_ID.wavesParticles, title: "Waves & Particles", parent: TAG_ID.physics},
        {id: TAG_ID.fields, title: "Fields", parent: TAG_ID.physics},
        {id: TAG_ID.thermal, title: "Thermal", parent: TAG_ID.physics},
        // Chemistry Fields
        {id: TAG_ID.foundations, title: `Founda${softHyphen}tions`, parent: TAG_ID.chemistry},
        {id: TAG_ID.physical, title: "Physical", parent: TAG_ID.chemistry},
        {id: TAG_ID.inorganic, title: "Inorganic", parent: TAG_ID.chemistry},
        {id: TAG_ID.organic, title: "Organic", parent: TAG_ID.chemistry},
        {id: TAG_ID.analytical, title: "Analytical", parent: TAG_ID.chemistry},
        // Maths Fields
        {id: TAG_ID.number, title: "Number", parent: TAG_ID.maths},
        {id: TAG_ID.algebra, title: "Algebra", parent: TAG_ID.maths},
        {id: TAG_ID.geometry, title: "Geometry", parent: TAG_ID.maths},
        {id: TAG_ID.functions, title: "Functions", parent: TAG_ID.maths},
        {id: TAG_ID.calculus, title: "Calculus", parent: TAG_ID.maths},
        {id: TAG_ID.statistics, title: "Statistics", parent: TAG_ID.maths},
        // Biology Fields
        {id: TAG_ID.cellBiology, title: "Cell Biology", parent: TAG_ID.biology},
        {id: TAG_ID.biochemistry, title: `Bio${softHyphen}chemistry`, parent: TAG_ID.biology},
        {id: TAG_ID.genetics, title: "Genetics", parent: TAG_ID.biology},
        {id: TAG_ID.physiology, title: "Physiology", parent: TAG_ID.biology},
        {id: TAG_ID.ecology, title: "Ecology", parent: TAG_ID.biology},
        {id: TAG_ID.evolution, title: "Evolution", parent: TAG_ID.biology},
        {id: TAG_ID.bioMathsSkills, title: "Maths Skills", parent: TAG_ID.biology},

        // --- Physics Topics ---

        // Mechanics
        {id: TAG_ID.statics, title: "Statics", parent: TAG_ID.mechanics},
        {id: TAG_ID.kinematics, title: `Kine${softHyphen}matics`, parent: TAG_ID.mechanics},
        {id: TAG_ID.dynamics, title: "Dynamics", parent: TAG_ID.mechanics},
        {id: TAG_ID.circularMotion, title: "Circular Motion", parent: TAG_ID.mechanics},
        {id: TAG_ID.oscillations, title: `Oscil${softHyphen}lations`, parent: TAG_ID.mechanics},
        {id: TAG_ID.materials, title: "Materials", parent: TAG_ID.mechanics},
        // Fields
        {id: TAG_ID.gravitational, title: `Gravi${softHyphen}tational Fields`, parent: TAG_ID.fields},
        {id: TAG_ID.electric, title: "Electric Fields", parent: TAG_ID.fields},
        {id: TAG_ID.magnetic, title: "Magnetic Fields", parent: TAG_ID.fields},
        {id: TAG_ID.combined, title: "Combined Fields", parent: TAG_ID.fields},
        // Thermal
        {id: TAG_ID.heatCapacity, title: "Heat", parent: TAG_ID.thermal},
        {id: TAG_ID.gases, title: "Gases", parent: TAG_ID.thermal},
        {id: TAG_ID.thermalRadiation, title: "Radiation", parent: TAG_ID.thermal, alias: "Thermal Radiation"},
        // Waves Particles
        {id: TAG_ID.optics, title: "Optics", parent: TAG_ID.wavesParticles},
        {id: TAG_ID.waveMotion, title: "Wave Motion", parent: TAG_ID.wavesParticles},
        {id: TAG_ID.superposition, title: `Super${softHyphen}position`, parent: TAG_ID.wavesParticles},
        {id: TAG_ID.quantum, title: "Quantum", parent: TAG_ID.wavesParticles},
        {id: TAG_ID.nuclear, title: "Nuclear", parent: TAG_ID.wavesParticles, alias: "Nuclear Particles"},
        {id: TAG_ID.fundamental, title: `Funda${softHyphen}mental Particles`, parent: TAG_ID.wavesParticles},
        // Skills
        {id: TAG_ID.sigFigs, title: "Significant Figures", parent: TAG_ID.skills},
        {id: TAG_ID.units, title: "Units", parent: TAG_ID.skills},
        {id: TAG_ID.prefixes, title: "Prefixes", parent: TAG_ID.skills},
        {id: TAG_ID.relationships, title: `Relation${softHyphen}ships`, parent: TAG_ID.skills},
        {id: TAG_ID.graphs, title: "Graphs", parent: TAG_ID.skills, alias: "Graph Skills"},
        {id: TAG_ID.uncertainties, title: `Un${softHyphen}certainties`, parent: TAG_ID.skills},
        // Electricity
        {id: TAG_ID.chargeCurrent, title: "Charge & Current", parent: TAG_ID.electricity},
        {id: TAG_ID.resistors, title: "Resistors", parent: TAG_ID.electricity},
        {id: TAG_ID.internalResistance, title: `Internal Resis${softHyphen}tance`, parent: TAG_ID.electricity},
        {id: TAG_ID.power, title: "Power", parent: TAG_ID.electricity, alias: "Electrical Power"},
        {id: TAG_ID.components, title: `Comp${softHyphen}onents`, parent: TAG_ID.electricity, alias: "Circuit Components"},
        {id: TAG_ID.capacitors, title: "Capacitors", parent: TAG_ID.electricity},

        // --- Maths Topics ---

        // Numbers
        {id: TAG_ID.arithmetic, title: "Arithmetic", parent: TAG_ID.number},
        {id: TAG_ID.rational, title: "Rational Numbers", parent: TAG_ID.number},
        {id: TAG_ID.factors, title: "Factors & Powers", parent: TAG_ID.number},
        {id: TAG_ID.complexNumbers, title: "Complex Numbers", parent: TAG_ID.number},
        // Algebra
        {id: TAG_ID.manipulation, title: `Manip${softHyphen}ulation`, parent: TAG_ID.algebra, alias: "Algebraic Manipulation"},
        {id: TAG_ID.quadratics, title: `Quadra${softHyphen}tics`, parent: TAG_ID.algebra},
        {id: TAG_ID.simultaneous, title: `Simul${softHyphen}taneous Equations`, parent: TAG_ID.algebra},
        {id: TAG_ID.series, title: "Series", parent: TAG_ID.algebra},
        {id: TAG_ID.matrices, title: "Matrices", parent: TAG_ID.algebra},
        // Geometry
        {id: TAG_ID.shapes, title: "Shapes", parent: TAG_ID.geometry, alias: "Geometric Shapes"},
        {id: TAG_ID.trigonometry, title: `Trigon${softHyphen}ometry`, parent: TAG_ID.geometry},
        {id: TAG_ID.vectors, title: "Vectors", parent: TAG_ID.geometry},
        {id: TAG_ID.planes, title: "Planes", parent: TAG_ID.geometry, alias: "Geometric Planes"},
        {id: TAG_ID.coordinates, title: "Coordinates", parent: TAG_ID.geometry},
        // Functions
        {id: TAG_ID.generalFunctions, title: "General Functions", parent: TAG_ID.functions},
        {id: TAG_ID.graphSketching, title: "Graph Sketching", parent: TAG_ID.functions},
        // Calculus
        {id: TAG_ID.differentiation, title: `Differen${softHyphen}tiation`, parent: TAG_ID.calculus},
        {id: TAG_ID.integration, title: `Inte${softHyphen}gration`, parent: TAG_ID.calculus},
        {id: TAG_ID.differentialEq, title: `Differ${softHyphen}ential Equations`, parent: TAG_ID.calculus},
        // Statistics
        {id: TAG_ID.dataAnalysis, title: "Data Analysis", parent: TAG_ID.statistics},
        {id: TAG_ID.probability, title: `Probabi${softHyphen}lity`, parent: TAG_ID.statistics},
        {id: TAG_ID.randomVariables, title: "Random Variables", parent: TAG_ID.statistics},
        {id: TAG_ID.hypothesisTests, title: `Hypo${softHyphen}thesis Tests`, parent: TAG_ID.statistics},

        // --- Chemistry Topics ---

        // Inorganic
        {id: TAG_ID.periodicTable, title: "Periodic Table", parent: TAG_ID.inorganic},
        {id: TAG_ID.bonding, title: "Bonding & IMFs", parent: TAG_ID.inorganic},
        {id: TAG_ID.redox, title: "Redox", parent: TAG_ID.inorganic},
        {id: TAG_ID.transitionMetals, title: `Transition Metals`, parent: TAG_ID.inorganic},
        // Physical
        {id: TAG_ID.kinetics, title: "Kinetics", parent: TAG_ID.physical},
        {id: TAG_ID.energetics, title: `Energe${softHyphen}tics`, parent: TAG_ID.physical, alias: "Chemical Energetics"},
        {id: TAG_ID.entropy, title: "Entropy", parent: TAG_ID.physical},
        {id: TAG_ID.equilibrium, title: `Equili${softHyphen}brium`, parent: TAG_ID.physical, alias: "Chemical Equilibrium"},
        {id: TAG_ID.acidsAndBases, title: "Acids & Bases", parent: TAG_ID.physical},
        {id: TAG_ID.electrochemistry, title: `Electro${softHyphen}chemistry`, parent: TAG_ID.physical},
        // Analytical
        {id: TAG_ID.chromatography, title: `Chroma${softHyphen}tography`, parent: TAG_ID.analytical},
        {id: TAG_ID.massSpectrometry, title: `Mass Spectro${softHyphen}metry`, parent: TAG_ID.analytical},
        {id: TAG_ID.infraredSpectroscopy, title: `IR Spectro${softHyphen}scopy`, parent: TAG_ID.analytical},
        {id: TAG_ID.nmrSpectroscopy, title: `NMR Spectro${softHyphen}scopy`, parent: TAG_ID.analytical},
        {id: TAG_ID.electronicSpectroscopy, title: `Electronic Spectro${softHyphen}scopy`, parent: TAG_ID.analytical},
        // Foundations
        {id: TAG_ID.numericalSkills, title: "Numerical Skills", parent: TAG_ID.foundations},
        {id: TAG_ID.atomicStructure, title: "Atomic Structure", parent: TAG_ID.foundations},
        {id: TAG_ID.stoichiometry, title: `Stoichio${softHyphen}metry`, parent: TAG_ID.foundations},
        {id: TAG_ID.gasLaws, title: "Gas Laws", parent: TAG_ID.foundations},
        // Organic
        {id: TAG_ID.functionalGroups, title: "Functional Groups", parent: TAG_ID.organic},
        {id: TAG_ID.isomerism, title: "Isomerism", parent: TAG_ID.organic},
        {id: TAG_ID.organicReactions, title: "Reactions", parent: TAG_ID.organic, alias: "Organic Reactions"},
        {id: TAG_ID.aromaticity, title: `Aroma${softHyphen}ticity`, parent: TAG_ID.organic},
        {id: TAG_ID.aromaticReactions, title: "Reactions (aromatics)", parent: TAG_ID.organic},
        {id: TAG_ID.polymers, title: "Polymers", parent: TAG_ID.organic},

        // --- Biology Topics ---

        // Cell biology
        {id: TAG_ID.cellStructure, title: `Cell Structure`, parent: TAG_ID.cellBiology},
        {id: TAG_ID.mitosis, title: "Mitosis", parent: TAG_ID.cellBiology},
        {id: TAG_ID.meiosis, title: "Meiosis", parent: TAG_ID.cellBiology},
        {id: TAG_ID.viruses, title: "Viruses", parent: TAG_ID.cellBiology},
        {id: TAG_ID.membraneTransport, title: "Membrane Transport", parent: TAG_ID.cellBiology},
        {id: TAG_ID.tissues, title: "Tissues", parent: TAG_ID.cellBiology},
        // Biochemistry
        {id: TAG_ID.proteins, title: "Proteins", parent: TAG_ID.biochemistry},
        {id: TAG_ID.carbohydrates, title: `Carbo${softHyphen}hydrates`, parent: TAG_ID.biochemistry},
        {id: TAG_ID.lipids, title: "Lipids", parent: TAG_ID.biochemistry},
        {id: TAG_ID.respiration, title: "Respiration", parent: TAG_ID.biochemistry},
        {id: TAG_ID.photosynthesis, title: `Photo${softHyphen}synthesis`, parent: TAG_ID.biochemistry},
        // Genetics
        {id: TAG_ID.dnaReplication, title: "DNA replication", parent: TAG_ID.genetics},
        {id: TAG_ID.transcription, title: `Trans${softHyphen}cription`, parent: TAG_ID.genetics},
        {id: TAG_ID.translation, title: `Trans${softHyphen}lation`, parent: TAG_ID.genetics},
        {id: TAG_ID.genesAndAlleles, title: `Genes & Alleles`, parent: TAG_ID.genetics},
        {id: TAG_ID.inheritance, title: "Inheritance", parent: TAG_ID.genetics},
        {id: TAG_ID.biotechnology, title: `Bio${softHyphen}technology`, parent: TAG_ID.genetics},
        // Physiology
        {id: TAG_ID.plants, title: "Plants", parent: TAG_ID.physiology, alias: "Plant Physiology"},
        {id: TAG_ID.breathingAndCirculation, title: "Breathing & Circulation", parent: TAG_ID.physiology},
        {id: TAG_ID.hormones, title: "Hormones", parent: TAG_ID.physiology},
        {id: TAG_ID.digestionAndExcretion, title: "Digestion & Excretion", parent: TAG_ID.physiology},
        {id: TAG_ID.senseAndMovement, title: "Sense & Movement", parent: TAG_ID.physiology},
        {id: TAG_ID.diseaseAndImmunity, title: "Disease & Immunity", parent: TAG_ID.physiology},
        // Ecology
        {id: TAG_ID.populations, title: "Populations", parent: TAG_ID.ecology},
        {id: TAG_ID.ecosystems, title: "Ecosystems", parent: TAG_ID.ecology},
        {id: TAG_ID.nutrientCycles, title: `Nutrient Cycles`, parent: TAG_ID.ecology},
        {id: TAG_ID.biodiversity, title: "Biodiversity", parent: TAG_ID.ecology},
        // Evolution
        {id: TAG_ID.variation, title: "Variation", parent: TAG_ID.evolution},
        {id: TAG_ID.theory, title: "Theory", parent: TAG_ID.evolution, alias: "Evolutionary Theory"},
        {id: TAG_ID.phylogenetics, title: `Phylo${softHyphen}genetics`, parent: TAG_ID.evolution},
        // Biology Maths Skills
        {id: TAG_ID.bioStatisticalTests, title: "Statistical Tests", parent: TAG_ID.bioMathsSkills}
    ];
    public getTagHierarchy() {return PhysicsTagService.tagHierarchy;}
    public getBaseTags() {return PhysicsTagService.baseTags;}
    public augmentDocWithSubject<T extends ContentDTO | ContentSummaryDTO>(doc: T) {
        const documentSubject = this.getPageSubjectTag((doc.tags || []) as TAG_ID[]);
        return {...doc, subjectId: documentSubject && documentSubject.id};
    }

    private getPageSubjectTag(tagArray: TAG_ID[]): Tag | undefined {
        // Extract the subject tag from a tag array,
        // defaulting to the current site subject if no tags
        // and intelligently choosing if more than one subject tag.
        const globalSubjectTagId = getTagFromPath();
        if (tagArray == null || tagArray.length == 0) {
            return globalSubjectTagId ? this.getById(globalSubjectTagId) : undefined;
        }

        const subjectTags = this.getSpecifiedTags(TAG_LEVEL.subject, tagArray, true);
        for (const i in subjectTags) {
            if (subjectTags[i].id == globalSubjectTagId) {
                return subjectTags[i];
            }
        }
        return subjectTags[0];
    }
}


