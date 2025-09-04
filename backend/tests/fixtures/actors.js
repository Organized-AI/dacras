const mockActors = [
  {
    id: 'actor_001',
    name: 'Emma Professional',
    gender: 'female',
    age_range: '25-35',
    style: 'professional',
    avatar_url: '/actors/emma.jpg',
    voice_id: 'voice_001',
    description: 'Professional businesswoman with confident presentation style',
    languages: ['en-US', 'en-GB'],
    personality_traits: ['confident', 'articulate', 'trustworthy'],
    use_cases: ['corporate', 'financial', 'healthcare']
  },
  {
    id: 'actor_002',
    name: 'David Casual',
    gender: 'male',
    age_range: '28-40',
    style: 'casual',
    avatar_url: '/actors/david.jpg',
    voice_id: 'voice_002',
    description: 'Friendly and approachable casual presenter',
    languages: ['en-US'],
    personality_traits: ['friendly', 'relatable', 'energetic'],
    use_cases: ['lifestyle', 'tech', 'entertainment']
  },
  {
    id: 'actor_003',
    name: 'Sarah Creative',
    gender: 'female',
    age_range: '22-30',
    style: 'creative',
    avatar_url: '/actors/sarah.jpg',
    voice_id: 'voice_003',
    description: 'Artistic and expressive creative presenter',
    languages: ['en-US', 'es-US'],
    personality_traits: ['artistic', 'expressive', 'innovative'],
    use_cases: ['fashion', 'design', 'arts']
  }
];

const mockActorFilters = {
  genders: ['male', 'female', 'non-binary'],
  age_ranges: ['18-25', '25-35', '35-45', '45-55', '55+'],
  styles: ['professional', 'casual', 'creative', 'authoritative', 'friendly'],
  languages: ['en-US', 'en-GB', 'es-US', 'fr-FR', 'de-DE']
};

const createMockActor = (overrides = {}) => ({
  id: `actor_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Actor',
  gender: 'female',
  age_range: '25-35',
  style: 'professional',
  avatar_url: '/actors/test.jpg',
  voice_id: `voice_${Math.random().toString(36).substr(2, 9)}`,
  description: 'Test actor for automated testing',
  languages: ['en-US'],
  personality_traits: ['professional'],
  use_cases: ['testing'],
  ...overrides
});

module.exports = {
  mockActors,
  mockActorFilters,
  createMockActor
};