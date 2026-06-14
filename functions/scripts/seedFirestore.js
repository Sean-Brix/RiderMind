import { seedFirestore, SAMPLE_ACCOUNTS } from '../src/seed/firestoreSeed.js';

try {
  const result = await seedFirestore();

  console.log('\nFirestore seed complete.');
  console.log('Sample accounts:');
  SAMPLE_ACCOUNTS.forEach(account => {
    console.log(`- ${account.role}: ${account.email} / ${account.password}`);
  });
  console.log('\nDocument counts:');
  Object.entries(result.counts).forEach(([collectionName, count]) => {
    console.log(`- ${collectionName}: ${count}`);
  });

  process.exit(0);
} catch (error) {
  console.error('\nFirestore seed failed.');

  if (error?.code === 5) {
    console.error(
      'No Firestore database was found for this Firebase project. ' +
      'Create the default Firestore database first, then rerun npm run seed.'
    );
    console.error('\nRecommended for this project, since Functions use us-central1:');
    console.error(
      '  npx -y firebase-tools@latest firestore:databases:create "(default)" ' +
      '--location=us-central1 --edition=standard'
    );
    console.error('\nThen run:');
    console.error('  npm run seed');
  } else if (error?.code === 14 && error?.details?.includes('certificate')) {
    console.error(
      'Could not connect to Firestore because Node could not verify the ' +
      'local TLS certificate chain.'
    );
    console.error('\nThis project now runs the seed with --use-system-ca by default.');
    console.error('Try again with:');
    console.error('  npm run seed');
  } else {
    console.error(error);
  }

  process.exit(1);
}
