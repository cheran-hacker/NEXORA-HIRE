import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import models
import { User } from '../src/models/User.js';
import { Skill } from '../src/models/Skill.js';
import { StudentSkill } from '../src/models/StudentSkill.js';
import { CareerTarget } from '../src/models/CareerTarget.js';

// ES Module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrate = async () => {
  console.log('Starting Non-Destructive Student Data Migration...');

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const students = await User.find({ role: 'Student' });
    console.log(`Found ${students.length} student records to process.`);

    let skillsMigrated = 0;
    let careerTargetsMigrated = 0;

    for (const student of students) {
      // 1. Migrate Skills
      if (student.studentProfile && student.studentProfile.skills && student.studentProfile.skills.length > 0) {
        for (const skillName of student.studentProfile.skills) {
          if (!skillName || typeof skillName !== 'string') continue;
          
          const normalized = skillName.trim().toLowerCase();
          if (!normalized) continue;

          // Find or create Skill dictionary entry
          let skillDoc = await Skill.findOne({ normalizedName: normalized });
          if (!skillDoc) {
            skillDoc = await Skill.create({ 
              name: skillName.trim(), 
              normalizedName: normalized 
            });
          }

          // Create mapping in StudentSkill if it doesn't exist
          const existingMapping = await StudentSkill.findOne({ 
            studentId: student._id, 
            skillId: skillDoc._id 
          });

          if (!existingMapping) {
            await StudentSkill.create({
              studentId: student._id,
              skillId: skillDoc._id,
              source: 'profile',
              proficiency: 50 // default
            });
            skillsMigrated++;
          }
        }
      }

      // 2. Migrate Career Target
      const legacyTarget = student.studentProfile?.targetCareerRole;
      if (legacyTarget && legacyTarget.trim()) {
        const existingTarget = await CareerTarget.findOne({ studentId: student._id });
        if (!existingTarget) {
          await CareerTarget.create({
            studentId: student._id,
            targetRole: legacyTarget.trim(),
            targetCompanies: [],
            preferredLocations: [],
            preferredJobTypes: [],
            preferredWorkModes: []
          });
          careerTargetsMigrated++;
        }
      }
    }

    console.log('Migration Completed Successfully!');
    console.log(`- Created/Verified ${skillsMigrated} new StudentSkill relationships.`);
    console.log(`- Created ${careerTargetsMigrated} new CareerTarget records.`);
    console.log('Note: Original embedded fields in User model were intentionally preserved for backward compatibility.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

migrate();
