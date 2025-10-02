// One-off script to grant Contributor role to a user by _id
import { connectToMongoDB } from '../src/configs/mongodb.config.js';
import { configEnv } from '../src/configs/env.config.js';
import { User } from '../src/models/index.d.js';

(async () => {
  try {
    configEnv();
    await connectToMongoDB();
    const userId = process.argv[2];
    if (!userId) {
      console.error('Usage: node scripts/seed-contributor.mjs <userId>');
      process.exit(1);
    }
    const updated = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { roles: 'Contributor' } },
      { new: true }
    ).select('email roles');
    if (!updated) {
      console.error('User not found');
      process.exit(2);
    }
    console.log(JSON.stringify({ email: updated.email, roles: updated.roles }));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(3);
  }
})();