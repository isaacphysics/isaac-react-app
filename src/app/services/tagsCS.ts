import {SUBJECTS, TAG_ID, TAG_LEVEL} from "./constants";
import {BaseTag} from "../../IsaacAppTypes";
import {ContentDTO} from "../../IsaacApiTypes";
import {AbstractBaseTagService} from "./tagsAbstract";

export class CsTagService extends AbstractBaseTagService {
    private static readonly tagHierarchy = [TAG_LEVEL.category, TAG_LEVEL.subcategory, TAG_LEVEL.topic];
    private static readonly baseTags: BaseTag[] = [
        // Categories
        {id: TAG_ID.computerScience, trustedTitle: "Computer Science"},

        // Computer science strands
        {id: TAG_ID.computerNetworks, trustedTitle: "Computer networks", parent: TAG_ID.computerScience},
        {id: TAG_ID.computerSystems, trustedTitle: "Computer systems", parent: TAG_ID.computerScience},
        {id: TAG_ID.cyberSecurity, trustedTitle: "Cybersecurity", parent: TAG_ID.computerScience},
        {id: TAG_ID.dataAndInformation, trustedTitle: "Data and information", parent: TAG_ID.computerScience},
        {id: TAG_ID.dataStructuresAndAlgorithms, trustedTitle: "Data structures and algorithms", parent: TAG_ID.computerScience},
        {id: TAG_ID.gcseToALevel, trustedTitle: "GCSE to A level transition", parent: TAG_ID.computerScience},
        {id: TAG_ID.impactsOfDigitalTechnology, trustedTitle: "Impacts of digital technology", parent: TAG_ID.computerScience},
        {id: TAG_ID.machineLearningAi, trustedTitle: "Machine learning and AI", parent: TAG_ID.computerScience, hidden: true},
        {id: TAG_ID.mathsForCs, trustedTitle: "Maths for computer science", parent: TAG_ID.computerScience},
        {id: TAG_ID.programmingFundamentals, trustedTitle: "Programming fundamentals", parent: TAG_ID.computerScience},
        {id: TAG_ID.programmingParadigms, trustedTitle: "Programming paradigms", parent: TAG_ID.computerScience},
        {id: TAG_ID.softwareEngineering, trustedTitle: "Software engineering", parent: TAG_ID.computerScience},
        {id: TAG_ID.theoryOfComputation, trustedTitle: "Theory of Computation", parent: TAG_ID.computerScience},

        // Computer networks topics
        {id: TAG_ID.networking, trustedTitle: "Network fundamentals", parent: TAG_ID.computerNetworks},
        {id: TAG_ID.theInternet, trustedTitle: "The internet", parent: TAG_ID.computerNetworks},
        {id: TAG_ID.networkHardware, trustedTitle: "Network hardware", parent: TAG_ID.computerNetworks},
        {id: TAG_ID.communication, trustedTitle: "Communication", parent: TAG_ID.computerNetworks},
        {id: TAG_ID.webTechnologies, trustedTitle: "Web technologies", parent: TAG_ID.computerNetworks},
        // Computer systems topics
        {id: TAG_ID.booleanLogic, trustedTitle: "Boolean logic", parent: TAG_ID.computerSystems},
        {id: TAG_ID.architecture, trustedTitle: "Systems architecture", parent: TAG_ID.computerSystems},
        {id: TAG_ID.memoryAndStorage, trustedTitle: "Memory and storage", parent: TAG_ID.computerSystems},
        {id: TAG_ID.hardware, trustedTitle: "Hardware", parent: TAG_ID.computerSystems},
        {id: TAG_ID.software, trustedTitle: "Software", parent: TAG_ID.computerSystems},
        {id: TAG_ID.operatingSystems, trustedTitle: "Operating systems", parent: TAG_ID.computerSystems},
        {id: TAG_ID.programmingLanguages, trustedTitle: "High- and low-level languages", parent: TAG_ID.computerSystems},
        {id: TAG_ID.translators, trustedTitle: "Translators", parent: TAG_ID.computerSystems},
        // Cyber security topics
        {id: TAG_ID.socialEngineering, trustedTitle: "Social engineering", parent: TAG_ID.cyberSecurity},
        {id: TAG_ID.maliciousCode, trustedTitle: "Malicious code", parent: TAG_ID.cyberSecurity},
        {id: TAG_ID.security, trustedTitle: "Network security", parent: TAG_ID.cyberSecurity},
        {id: TAG_ID.identificationPrevention, trustedTitle: "Managing security threats", parent: TAG_ID.cyberSecurity},
        // Data and information topics
        {id: TAG_ID.numberRepresentation, trustedTitle: "Representation of numbers", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.textRepresentation, trustedTitle: "Representation of text", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.imageRepresentation, trustedTitle: "Representation of images", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.soundRepresentation, trustedTitle: "Representation of sound", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.compression, trustedTitle: "Compression", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.encryption, trustedTitle: "Encryption", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.databases, trustedTitle: "Database concepts", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.sql, trustedTitle: "SQL", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.bigData, trustedTitle: "Big Data", parent: TAG_ID.dataAndInformation},
        // Data structures and algorithms topics
        {id: TAG_ID.dataStructures, trustedTitle: "Data structures", parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.searching, trustedTitle: "Searching algorithms", parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.sorting, trustedTitle: "Sorting algorithms", parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.pathfinding, trustedTitle: "Pathfinding algorithms", parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.complexity, trustedTitle: "Complexity", parent: TAG_ID.dataStructuresAndAlgorithms},
        // GCSE to A level transition topics
        {id: TAG_ID.gcseProgrammingConcepts, trustedTitle: "GCSE Programming concepts", parent: TAG_ID.gcseToALevel},
        {id: TAG_ID.gcseDataRepresentation, trustedTitle: "GCSE Data representation", parent: TAG_ID.gcseToALevel},
        {id: TAG_ID.gcseBooleanLogic, trustedTitle: "GCSE Boolean logic", parent: TAG_ID.gcseToALevel},
        {id: TAG_ID.gcseSystems, trustedTitle: "GCSE Systems", parent: TAG_ID.gcseToALevel},
        {id: TAG_ID.gcseNetworking, trustedTitle: "GCSE Networking", parent: TAG_ID.gcseToALevel},
        // Impacts of technology topics
        {id: TAG_ID.legislation, trustedTitle: "Legislation", parent: TAG_ID.impactsOfDigitalTechnology},
        {id: TAG_ID.impactsOfTech, trustedTitle: "Impacts of technology", parent: TAG_ID.impactsOfDigitalTechnology},
        //Machine learning topics
        {id: TAG_ID.graphsForAi, trustedTitle: "Graphs to aid AI", parent: TAG_ID.machineLearningAi, hidden: true},
        {id: TAG_ID.neuralNetworks, trustedTitle: "Artificial neural networks", parent: TAG_ID.machineLearningAi, hidden: true},
        {id: TAG_ID.machineLearning, trustedTitle: "Types of machine learning", parent: TAG_ID.machineLearningAi, hidden: true},
        {id: TAG_ID.backpropagationAndRegression, trustedTitle: "Backpropagation and regression", parent: TAG_ID.machineLearningAi, hidden: true},
        // Maths for cs topics
        {id: TAG_ID.numberSystems, trustedTitle: "Number systems and sets", parent: TAG_ID.mathsForCs},
        {id: TAG_ID.mathsFunctions, trustedTitle: "Mathematical functions", parent: TAG_ID.mathsForCs},
        // Programming  fundamentals topics
        {id: TAG_ID.programmingConcepts, trustedTitle: "Programming concepts", parent: TAG_ID.programmingFundamentals},
        {id: TAG_ID.stringHandling, trustedTitle: "String handling", parent: TAG_ID.programmingFundamentals},
        {id: TAG_ID.subroutines, trustedTitle: "Subroutines", parent: TAG_ID.programmingFundamentals},
        {id: TAG_ID.files, trustedTitle: "File handling", parent: TAG_ID.programmingFundamentals},
        {id: TAG_ID.recursion, trustedTitle: "Recursion", parent: TAG_ID.programmingFundamentals},
        {id: TAG_ID.ide, trustedTitle: "IDEs", parent: TAG_ID.programmingFundamentals},
        // Programming paradigms topics:
        {id: TAG_ID.proceduralProgramming, trustedTitle: "Procedural programming", parent: TAG_ID.programmingParadigms},
        {id: TAG_ID.objectOrientedProgramming, trustedTitle: "Object-oriented programming", parent: TAG_ID.programmingParadigms},
        {id: TAG_ID.functionalProgramming, trustedTitle: "Functional programming", parent: TAG_ID.programmingParadigms},
        {id: TAG_ID.eventDrivenProgramming, trustedTitle: "Event-driven programming", parent: TAG_ID.programmingParadigms},
        {id: TAG_ID.declarativeProgramming, trustedTitle: "Declarative programming", parent: TAG_ID.programmingParadigms, hidden: true},
        // Software engineering topics
        {id: TAG_ID.programDesign, trustedTitle: "Program design", parent: TAG_ID.softwareEngineering},
        {id: TAG_ID.testing, trustedTitle: "Testing", parent: TAG_ID.softwareEngineering},
        {id: TAG_ID.softwareEngineeringPrinciples, trustedTitle: "Software engineering principles", parent: TAG_ID.softwareEngineering},
        {id: TAG_ID.softwareProject, trustedTitle: "A level programming project / NEA", parent: TAG_ID.softwareEngineering},
        // Theory of computation topics
        {id: TAG_ID.computationalThinking, trustedTitle: "Computational thinking", parent: TAG_ID.theoryOfComputation},
        {id: TAG_ID.modelsOfComputation, trustedTitle: "Models of computation", parent: TAG_ID.theoryOfComputation}

    ];
    public getTagHierarchy() {return CsTagService.tagHierarchy;}
    public getBaseTags() {return CsTagService.baseTags;}
    public augmentDocWithSubject(doc: ContentDTO) {
        return Object.assign(doc, {subjectId: SUBJECTS.CS});
    }
}
