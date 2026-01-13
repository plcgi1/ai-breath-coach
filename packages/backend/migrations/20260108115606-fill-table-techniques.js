"use strict";
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */

export const up = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(`
TRUNCATE technique CASCADE;

INSERT INTO technique (name, slug, description, tags, symptoms, settings, rounds, audio, "createdAt", "updatedAt" )
VALUES
    (
        'Квадратное дыхание',
        'focus',
        'Базовая техника для стабилизации. Использовать при умеренном стрессе, потере концентрации, сумбуре в мыслях или легком волнении. Помогает вернуть контроль над ситуацией.',
        ARRAY['focus','balance','neutral','clarity','баланс','фокус','стабильность'],
        ARRAY['расфокус','туман в голове','суета','прокрастинация','рабочее напряжение','мандраж','тревога'],
        '{ "inhale": 4, "hold1": 4, "exhale": 4, "hold2": 4 }',
        18,
        '{ "instructionUrl": "/audio/voice/focus_inhale.mp3", "backgroundUrl": "/audio/bg/deep_focus.mp3" }',
        NOW(),
        NOW()
    ),
    (
        '4-7-8',
        'calm',
        'Сильное седативное воздействие. Использовать при острых состояниях: паника, физическая дрожь, сильная тревога, бессонница, гнев или страх. Работает через активацию блуждающего нерва.',
        ARRAY['panic','anxiety','tremor','insomnia','vagus','успокоение','сон','торможение'],
        ARRAY['дрожь','тремор','паника','сердцебиение','ярость','злость','страх','бессонница','перевозбуждение','много энергии'],
        '{ "inhale": 4, "hold1": 0, "exhale": 7, "hold2": 8 }',
        18,
        '{ "instructionUrl": "/audio/voice/calm_inhale.mp3", "backgroundUrl": "/audio/bg/deep_relax.mp3" }',
        NOW(),
        NOW()
    ),
    (
     'Бодрящее дыхание',
        'energy',
        'Активирующая техника. Использовать при апатии, сонливости, упадке сил, заторможенности или когда нужно быстро проснуться. Повышает частоту сердечных сокращений.',
        ARRAY['energy','alert','fatigue','wakeup','power','энергия','тонус', 'активация'],
        ARRAY['апатия', 'сонливость', 'упадок сил', 'заторможенность'],
        '{ "inhale": 2, "hold1": 0, "exhale": 2, "hold2": 0 }',
        18,
        '{ "instructionUrl": "/audio/voice/energy_inhale.mp3", "backgroundUrl": "/audio/bg/deep_energy.mp3" }',
        NOW(),
        NOW()
    );

      `);
};

export const down = async () => {
  // Нет отката для заполнения таблицы
};
