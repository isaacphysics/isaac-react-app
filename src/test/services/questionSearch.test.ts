import { ChoiceTree } from "../../app/components/elements/panels/QuestionFinderFilterPanel";
import { isAda, TAG_ID, tags, updateTopicChoices } from "../../app/services";

describe('updateTopicChoices', () => {
    if (isAda) {
        return it('is not tested for Ada', () => {});
    }

    describe('on the main question finder', () => {
        const pageContext = {subject: undefined, stage: []};

        it('returns just the subjects when no selections were made', () => {
            const choices = updateTopicChoices([{}, {}, {}], pageContext); 
            expect(choices).toEqual([subject(TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology)]);
        });

        it('shows the fields when subject is selected', () => {
            const choices = updateTopicChoices([subject(TAG_ID.physics), {}, {}], pageContext); 
            expect(choices).toEqual([
                subject(TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology),
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal)
            ]);
        });

        it('shows the topics when field is selected', () => {
            const choices = updateTopicChoices([subject(TAG_ID.physics), physics(TAG_ID.thermal), {}], pageContext); 
            expect(choices).toEqual([
                subject(TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology),
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
                thermal(TAG_ID.heatCapacity, TAG_ID.gases, TAG_ID.thermalRadiation)
            ]);
        });

        it('does not modify selections when topics are selected', () => {
            const choices = updateTopicChoices(
                [subject(TAG_ID.physics), physics(TAG_ID.thermal), thermal(TAG_ID.heatCapacity)], pageContext
            ); 
            expect(choices).toEqual([
                subject(TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology),
                physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                    TAG_ID.thermal),
                thermal(TAG_ID.heatCapacity, TAG_ID.gases, TAG_ID.thermalRadiation)
            ]);
        });

        it('handles multiple topic, field selections', () => {
            const choices = updateTopicChoices([
                subject(TAG_ID.physics, TAG_ID.maths),
                {...physics(TAG_ID.thermal), ...maths(TAG_ID.calculus)},
                {...thermal(TAG_ID.heatCapacity), ...calculus(TAG_ID.differentiation)}
            ], pageContext);
            expect(choices).toEqual([
                subject(TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology),
                {
                    ...physics(TAG_ID.skills, TAG_ID.mechanics, TAG_ID.electricity, TAG_ID.wavesParticles, TAG_ID.fields,
                        TAG_ID.thermal),
                    ...maths(TAG_ID.number, TAG_ID.algebra, TAG_ID.geometry, TAG_ID.functions, TAG_ID.calculus,
                        TAG_ID.statistics)
                },
                {
                    ...thermal(TAG_ID.heatCapacity, TAG_ID.gases, TAG_ID.thermalRadiation),
                    ...calculus(TAG_ID.differentiation, TAG_ID.integration, TAG_ID.differentialEq)
                }
            ]);
        });
    });
});

const subject = (...choices: TAG_ID[]): ChoiceTree => ({subject: choices.map(choice)});
const physics = (...choices: TAG_ID[]): ChoiceTree => ({physics: choices.map(choice)});
const maths = (...choices: TAG_ID[]): ChoiceTree => ({maths: choices.map(choice)});
const thermal = (...choices: TAG_ID[]): ChoiceTree => ({thermal: choices.map(choice)});
const calculus = (...choices: TAG_ID[]): ChoiceTree => ({calculus: choices.map(choice)});

const choice = (tagId: TAG_ID) => ({label: tags.getById(tagId).title, value: tagId}); 