'use strict'
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up({ context: queryInterface }) {
    const priceFreeId = '10000000-0000-0000-0000-000000000001'
    const pricePId = ''
const breathingPractices = [
  {
    name: "Heart Coherence",
    slug: "heart-coherence",
    description: "A bio-resonance technique to synchronize heart and brain. Eliminates internal chaos and levels out the emotional background.",
    tags: ["Emotional Intelligence", "Stability", "Balance", "Inner Peace", "Heart Rate Variability"],
    symptoms: ["Panic", "Irritability", "Anger", "Anxiety", "Palpitations", "Emotional Shock", "High Stress"],
    icon: "💚",
    color: "from-emerald-400 to-teal-500",
    free: false,
    settings: [
      { inhale: 4, holdIn: 0, exhale: 4, holdOut: 0, rounds: 12 },
      { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0, rounds: 12 },
      { inhale: 6, holdIn: 0, exhale: 6, holdOut: 0, rounds: 12 }
    ]
  },
  {
    name: "Moon Rest",
    slug: "moon-rest",
    description: "Lowers cerebral cortex activity and body temperature, preparing the body for deep sleep phases.",
    tags: ["Deep Sleep", "Sedation", "Bedtime Relaxation", "System Inhibition", "Melatonin Boost"],
    symptoms: ["Insomnia", "Racing Thoughts", "Nighttime Restlessness", "Hyperarousal", "Body Tension", "Sleep Deprivation"],
    icon: "🌙",
    color: "from-indigo-500 to-purple-600",
    free: false,
    settings: [
      { inhale: 3, holdIn: 0, exhale: 6, holdOut: 3, rounds: 6 },
      { inhale: 3, holdIn: 0, exhale: 7, holdOut: 4, rounds: 6 },
      { inhale: 3, holdIn: 0, exhale: 8, holdOut: 5, rounds: 4 }
    ]
  },
  {
    name: "Clarity Triangle",
    slug: "clarity-triangle",
    description: "A 'cognitive filter' method. Inhalation breath-holding helps structure thoughts and increases CO2 levels for brain cell nourishment.",
    tags: ["Mental Clarity", "Learning", "Memory", "Analytical Thinking", "Flow State"],
    symptoms: ["Brain Fog", "Mental Slowdown", "Lack of Focus", "Mental Fatigue", "Procrastination", "Absent-mindedness"],
    icon: "🔺",
    color: "from-violet-400 to-fuchsia-500",
    free: false,
    settings: [
      { inhale: 4, holdIn: 4, exhale: 4, holdOut: 0, rounds: 10 },
      { inhale: 5, holdIn: 5, exhale: 5, holdOut: 0, rounds: 8 },
      { inhale: 6, holdIn: 6, exhale: 6, holdOut: 0, rounds: 6 }
    ]
  },
  {
    name: "Sunrise Flow",
    slug: "sunrise-flow",
    description: "Gentle stimulation of the sympathetic nervous system. Replaces the first cup of coffee by oxygenating the blood without pressure spikes.",
    tags: ["Morning Wake-up", "Vitality", "Natural Energy", "Productivity", "Freshness"],
    symptoms: ["Morning Weakness", "Heavy Head", "Low Blood Pressure", "Apathy", "Drowsiness", "Sluggishness"],
    icon: "🌅",
    color: "from-amber-400 to-orange-500",
    free: false,
    settings: [
      { inhale: 3, holdIn: 1, exhale: 3, holdOut: 0, rounds: 10 },
      { inhale: 4, holdIn: 2, exhale: 4, holdOut: 0, rounds: 8 },
      { inhale: 5, holdIn: 3, exhale: 5, holdOut: 0, rounds: 6 }
    ]
  },
  {
    name: "Deep Reset",
    slug: "deep-reset",
    description: "Emergency discharge of accumulated tension. A long hold after exhalation 'reboots' the vagus nerve.",
    tags: ["Anti-Burnout", "Psychological Discharge", "Resource Recovery", "Tension Release", "Vagus Nerve Stimulation"],
    symptoms: ["Chronic Stress", "Feeling Constricted", "Lump in Throat", "Emotional Exhaustion", "Muscle Armor", "Feeling Drained"],
    icon: "🔄",
    color: "from-cyan-400 to-blue-600",
    free: false,
    settings: [
      { inhale: 5, holdIn: 2, exhale: 7, holdOut: 0, rounds: 10 },
      { inhale: 0, holdIn: 0, exhale: 0, holdOut: 25, rounds: 1 },
      { inhale: 6, holdIn: 4, exhale: 8, holdOut: 0, rounds: 8 }
    ]
  }
];


  },
}
