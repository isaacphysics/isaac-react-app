import {SUBJECTS, TAG_ID, TAG_LEVEL} from "./constants";
import {BaseTag} from "../../IsaacAppTypes";
import {ContentDTO} from "../../IsaacApiTypes";
import {AbstractBaseTagService} from "./tagsAbstract";

export class CsTagService extends AbstractBaseTagService {
    private static readonly tagHierarchy = [TAG_LEVEL.category, TAG_LEVEL.subcategory, TAG_LEVEL.topic];
    private static readonly baseTags: BaseTag[] = [
        // Categories
        {id: TAG_ID.computerScience, title: "Computer Science"},

        // Computer science strands
        {id: TAG_ID.gcseToALevel, title: "GCSE to A level", parent: TAG_ID.computerScience},
        {id: TAG_ID.dataAndInformation, title: "Data and information", parent: TAG_ID.computerScience},
        {id: TAG_ID.dataStructuresAndAlgorithms, title: "Data structures and algorithms", parent: TAG_ID.computerScience},
        {id: TAG_ID.computerNetworks, title: "Computer networks", parent: TAG_ID.computerScience},
        {id: TAG_ID.computerSystems, title: "Computer systems", parent: TAG_ID.computerScience},
        {id: TAG_ID.programmingFundamentals, title: "Programming fundamentals", parent: TAG_ID.computerScience},
        {id: TAG_ID.programmingParadigms, title: "Programming paradigms", parent: TAG_ID.computerScience},
        {id: TAG_ID.cyberSecurity, title: "Cyber security", parent: TAG_ID.computerScience},
        {id: TAG_ID.impactsOfTechnology, title: "Impacts of technology", parent: TAG_ID.computerScience},
        {id: TAG_ID.machineLearningAi, title: "Machine learning and AI", parent: TAG_ID.computerScience, hidden: true},
        {id: TAG_ID.mathsForCs, title: "Maths for Computer Science", parent: TAG_ID.computerScience},
        {id: TAG_ID.softwareEngineering, title: "Software Engineering", parent: TAG_ID.computerScience},
        {id: TAG_ID.theoryOfComputation, title: "Theory of Computation", parent: TAG_ID.computerScience},

        // Computer networks topics
        {id: TAG_ID.networking, title: "Network fundamentals", parent: TAG_ID.computerNetworks},
        {id: TAG_ID.theInternet, title: "The internet", parent: TAG_ID.computerNetworks},
        {id: TAG_ID.networkHardware, title: "Network hardware", parent: TAG_ID.computerNetworks},
        {id: TAG_ID.communication, title: "Communication", parent: TAG_ID.computerNetworks},
        {id: TAG_ID.webTechnologies, title: "Web technologies", parent: TAG_ID.computerNetworks},
        // Computer systems topics
        {id: TAG_ID.booleanLogic, title: "Boolean logic", parent: TAG_ID.computerSystems},
        {id: TAG_ID.architecture, title: "Systems architecture", parent: TAG_ID.computerSystems},
        {id: TAG_ID.memoryAndStorage, title: "Memory and storage", parent: TAG_ID.computerSystems},
        {id: TAG_ID.hardware, title: "Hardware", parent: TAG_ID.computerSystems},
        {id: TAG_ID.software, title: "Software", parent: TAG_ID.computerSystems},
        {id: TAG_ID.operatingSystems, title: "Operating systems", parent: TAG_ID.computerSystems},
        {id: TAG_ID.programmingLanguages, title: "High and low level languages", parent: TAG_ID.computerSystems},
        {id: TAG_ID.translators, title: "Translators", parent: TAG_ID.computerSystems},
        // Cyber security topics
        {id: TAG_ID.socialEngineering, title: "Social engineering", parent: TAG_ID.cyberSecurity},
        {id: TAG_ID.maliciousCode, title: "Malicious code", parent: TAG_ID.cyberSecurity},
        {id: TAG_ID.security, title: "Network security", parent: TAG_ID.cyberSecurity},
        {id: TAG_ID.identificationPrevention, title: "Identification and prevention", parent: TAG_ID.cyberSecurity},
        // Data and information topics
        {id: TAG_ID.numberRepresentation, title: "Representation of numbers", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.textRepresentation, title: "Representation of text", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.imageRepresentation, title: "Representation of images", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.soundRepresentation, title: "Representation of sound", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.compression, title: "Compression", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.encryption, title: "Encryption", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.databases, title: "Database concepts", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.sql, title: "SQL", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.bigData, title: "Big Data", parent: TAG_ID.dataAndInformation},
        // Data structures and algorithms topics
        {id: TAG_ID.dataStructures, title: "Data structures", parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.searching, title: "Searching algorithms", parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.sorting, title: "Sorting algorithms", parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.pathfinding, title: "Pathfinding algorithms", parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.complexity, title: "Complexity", parent: TAG_ID.dataStructuresAndAlgorithms},
        // GCSE to A level transition topics
        {id: TAG_ID.gcseProgrammingConcepts, title: "GCSE Programming concepts", parent: TAG_ID.gcseToALevel},
        {id: TAG_ID.gcseDataRepresentation, title: "GCSE Data representation", parent: TAG_ID.gcseToALevel},
        {id: TAG_ID.gcseBooleanLogic, title: "GCSE Boolean logic", parent: TAG_ID.gcseToALevel},
        {id: TAG_ID.gcseSystems, title: "GCSE Systems", parent: TAG_ID.gcseToALevel},
        {id: TAG_ID.gcseNetworking, title: "GCSE Networking", parent: TAG_ID.gcseToALevel},
        // Impacts of technology topics
        {id: TAG_ID.legal, title: "Legal", parent: TAG_ID.impactsOfTechnology},
        {id: TAG_ID.moral, title: "Moral", parent: TAG_ID.impactsOfTechnology, hidden: true},
        {id: TAG_ID.ethical, title: "Ethical", parent: TAG_ID.impactsOfTechnology},
        {id: TAG_ID.cultural, title: "Cultural", parent: TAG_ID.impactsOfTechnology},
        {id: TAG_ID.environmental, title: "Environmental", parent: TAG_ID.impactsOfTechnology},
        {id: TAG_ID.trends, title: "Trends", parent: TAG_ID.impactsOfTechnology, hidden: true},
        //Machine learning topics
        {id: TAG_ID.graphsForAi, title: "Graphs to aid AI", parent: TAG_ID.machineLearningAi},
        {id: TAG_ID.neuralNetworks, title: "Artificial neural networks", parent: TAG_ID.machineLearningAi},
        {id: TAG_ID.machineLearning, title: "Types of machine learning", parent: TAG_ID.machineLearningAi},
        {id: TAG_ID.backpropagationAndRegression, title: "Backpropagation and regression", parent: TAG_ID.machineLearningAi},
        // Maths for cs topics
        {id: TAG_ID.numberSystems, title: "Number systems and sets", parent: TAG_ID.mathsForCs},
        {id: TAG_ID.mathsFunctions, title: "Functions", parent: TAG_ID.mathsForCs},
        // Programming  fundamentals topics
        {id: TAG_ID.programmingConcepts, title: "Programming concepts", parent: TAG_ID.programmingFundamentals},
        {id: TAG_ID.stringHandling, title: "String handling", parent: TAG_ID.programmingFundamentals},
        {id: TAG_ID.subroutines, title: "Subroutines", parent: TAG_ID.programmingFundamentals},
        {id: TAG_ID.files, title: "File handling", parent: TAG_ID.programmingFundamentals},
        {id: TAG_ID.recursion, title: "Recursion", parent: TAG_ID.programmingFundamentals},
        {id: TAG_ID.ide, title: "IDEs", parent: TAG_ID.programmingFundamentals},
        // Programming paradigms topics:
        {id: TAG_ID.proceduralProgramming, title: "Procedural programming", parent: TAG_ID.programmingParadigms},
        {id: TAG_ID.objectOrientedProgramming, title: "Object-oriented programming", parent: TAG_ID.programmingParadigms},
        {id: TAG_ID.functionalProgramming, title: "Functional programming", parent: TAG_ID.programmingParadigms},
        {id: TAG_ID.eventDrivenProgramming, title: "Event-driven programming", parent: TAG_ID.programmingParadigms},
        {id: TAG_ID.declarativeProgramming, title: "Declarative programming", parent: TAG_ID.programmingParadigms, hidden: true},
        // Software engineering topics
        {id: TAG_ID.programDesign, title: "Program design", parent: TAG_ID.softwareEngineering},
        {id: TAG_ID.testing, title: "Testing", parent: TAG_ID.softwareEngineering},
        {id: TAG_ID.softwareEngineeringPrinciples, title: "Software engineering principles", parent: TAG_ID.softwareEngineering},
        {id: TAG_ID.softwareProject, title: "Programming project / NEA", parent: TAG_ID.softwareEngineering},
        // Theory of computation topics
        {id: TAG_ID.computationalThinking, title: "Computational thinking", parent: TAG_ID.theoryOfComputation},
        {id: TAG_ID.modelsOfComputation, title: "Models of computation", parent: TAG_ID.theoryOfComputation}

    ];
    public getTagHierarchy() {return CsTagService.tagHierarchy;}
    public getBaseTags() {return CsTagService.baseTags;}
    public augmentDocWithSubject(doc: ContentDTO) {
        return Object.assign(doc, {subjectId: SUBJECTS.CS});
    }
}
