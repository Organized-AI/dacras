const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const AI_ACTORS = [
  {
    id: 'actor_001',
    name: 'Emma Professional',
    gender: 'female',
    age_range: '25-35',
    style: 'professional',
    avatar_url: '/actors/emma.jpg',
    voice_id: 'voice_001'
  },
  {
    id: 'actor_002',
    name: 'Marcus Creative',
    gender: 'male',
    age_range: '28-40',
    style: 'creative',
    avatar_url: '/actors/marcus.jpg',
    voice_id: 'voice_002'
  },
  {
    id: 'actor_003',
    name: 'Sofia Energetic',
    gender: 'female',
    age_range: '22-30',
    style: 'energetic',
    avatar_url: '/actors/sofia.jpg',
    voice_id: 'voice_003'
  }
];

const seedActors = async () => {
  const actorsCollection = db.collection('actors');
  console.log('Seeding actors...');
  for (const actor of AI_ACTORS) {
    await actorsCollection.doc(actor.id).set(actor);
    console.log(`Seeded actor: ${actor.name}`);
  }
  console.log('Seeding complete.');
};

seedActors().then(() => process.exit(0));
