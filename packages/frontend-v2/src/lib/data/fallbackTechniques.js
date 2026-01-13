// src/lib/data/fallbackTechniques.js
export const FALLBACK_TECHNIQUES = [
    { 
        slug: 'calm', 
        icon: '😌', 
        color: 'from-rose-500 to-pink-600',
        tags: ['calm', 'anxiety'],
        settings: [{ inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, rounds: 5 }]
    },
    { 
        slug: 'energy', 
        icon: '⚡', 
        color: 'from-amber-500 to-orange-600',
        tags: ['focus', 'power'],
        settings: [{ inhale: 2, holdIn: 0, exhale: 2, holdOut: 0, rounds: 15 }],
    },
    { 
        slug: 'focus', 
        icon: '🎯', 
        color: 'from-teal-500 to-emerald-600', 
        tags: ['work', 'study'],
        settings: [{ inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, rounds: 10 }],
    }
];