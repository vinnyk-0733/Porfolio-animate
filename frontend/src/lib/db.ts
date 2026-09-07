import { getDatabase } from "@/lib/mongodb";
import {
  ProfileData,
  ProjectItem,
  SkillsData,
  CertificationItem,
  ExperienceData,
  TimelineSectionItem,
  SocialItem,
  defaultProfile,
  defaultProjects,
  defaultSkills,
  defaultCertifications,
  defaultExperience,
  defaultTimeline,
  defaultSocials,
} from "@/lib/default-data";

// Helper to remove MongoDB internal _id before returning to frontend
function cleanMongoDoc<T>(doc: any): T {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest as T;
}

// 1. Profile Data
export async function getProfileData(): Promise<ProfileData> {
  try {
    const db = await getDatabase();
    if (!db) return defaultProfile;

    const doc = await db.collection("profile").findOne({});
    if (!doc) return defaultProfile;

    return cleanMongoDoc<ProfileData>(doc);
  } catch (err) {
    console.warn("Failed to get profile from MongoDB, using fallback:", err);
    return defaultProfile;
  }
}

export async function updateProfileData(data: Partial<ProfileData>): Promise<ProfileData> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not connected");

  const current = await getProfileData();
  const updated = { ...current, ...data };

  await db.collection("profile").updateOne(
    {},
    { $set: updated },
    { upsert: true }
  );

  return updated;
}

// 2. Projects Data
export async function getProjectsData(): Promise<ProjectItem[]> {
  try {
    const db = await getDatabase();
    if (!db) return defaultProjects;

    const docs = await db.collection("projects").find({}).sort({ order: 1 }).toArray();
    if (!docs || docs.length === 0) return defaultProjects;

    return docs.map((doc) => cleanMongoDoc<ProjectItem>(doc));
  } catch (err) {
    console.warn("Failed to get projects from MongoDB, using fallback:", err);
    return defaultProjects;
  }
}

export async function updateProjectsData(projects: ProjectItem[]): Promise<ProjectItem[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not connected");

  await db.collection("projects").deleteMany({});
  if (projects.length > 0) {
    await db.collection("projects").insertMany(projects);
  }
  return projects;
}

// 3. Skills Data
export async function getSkillsData(): Promise<SkillsData> {
  try {
    const db = await getDatabase();
    if (!db) return defaultSkills;

    const doc = await db.collection("skills").findOne({});
    if (!doc) return defaultSkills;

    return cleanMongoDoc<SkillsData>(doc);
  } catch (err) {
    console.warn("Failed to get skills from MongoDB, using fallback:", err);
    return defaultSkills;
  }
}

export async function updateSkillsData(data: Partial<SkillsData>): Promise<SkillsData> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not connected");

  const current = await getSkillsData();
  const updated = { ...current, ...data };

  await db.collection("skills").updateOne(
    {},
    { $set: updated },
    { upsert: true }
  );

  return updated;
}

// 4. Certifications Data
export async function getCertificationsData(): Promise<CertificationItem[]> {
  try {
    const db = await getDatabase();
    if (!db) return defaultCertifications;

    const docs = await db.collection("certifications").find({}).sort({ order: 1 }).toArray();
    if (!docs || docs.length === 0) return defaultCertifications;

    return docs.map((doc) => cleanMongoDoc<CertificationItem>(doc));
  } catch (err) {
    console.warn("Failed to get certifications from MongoDB, using fallback:", err);
    return defaultCertifications;
  }
}

export async function updateCertificationsData(certifications: CertificationItem[]): Promise<CertificationItem[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not connected");

  await db.collection("certifications").deleteMany({});
  if (certifications.length > 0) {
    await db.collection("certifications").insertMany(certifications);
  }
  return certifications;
}

// 5. Experience Data
export async function getExperienceData(): Promise<ExperienceData> {
  try {
    const db = await getDatabase();
    if (!db) return defaultExperience;

    const doc = await db.collection("experience").findOne({});
    if (!doc) return defaultExperience;

    return cleanMongoDoc<ExperienceData>(doc);
  } catch (err) {
    console.warn("Failed to get experience from MongoDB, using fallback:", err);
    return defaultExperience;
  }
}

export async function updateExperienceData(data: Partial<ExperienceData>): Promise<ExperienceData> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not connected");

  const current = await getExperienceData();
  const updated = { ...current, ...data };

  await db.collection("experience").updateOne(
    {},
    { $set: updated },
    { upsert: true }
  );

  return updated;
}

// 6. Timeline Data (Radial Orbital Timeline)
export async function getTimelineData(): Promise<TimelineSectionItem[]> {
  try {
    const db = await getDatabase();
    if (!db) return defaultTimeline;

    const docs = await db.collection("timeline").find({}).sort({ id: 1 }).toArray();
    if (!docs || docs.length === 0) return defaultTimeline;

    return docs.map((doc) => cleanMongoDoc<TimelineSectionItem>(doc));
  } catch (err) {
    console.warn("Failed to get timeline from MongoDB, using fallback:", err);
    return defaultTimeline;
  }
}

export async function updateTimelineData(timeline: TimelineSectionItem[]): Promise<TimelineSectionItem[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not connected");

  await db.collection("timeline").deleteMany({});
  if (timeline.length > 0) {
    await db.collection("timeline").insertMany(timeline);
  }
  return timeline;
}

// 7. Socials Data
export async function getSocialsData(): Promise<SocialItem[]> {
  try {
    const db = await getDatabase();
    if (!db) return defaultSocials;

    const docs = await db.collection("socials").find({}).toArray();
    if (!docs || docs.length === 0) return defaultSocials;

    return docs.map((doc) => cleanMongoDoc<SocialItem>(doc));
  } catch (err) {
    console.warn("Failed to get socials from MongoDB, using fallback:", err);
    return defaultSocials;
  }
}

export async function updateSocialsData(socials: SocialItem[]): Promise<SocialItem[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not connected");

  await db.collection("socials").deleteMany({});
  if (socials.length > 0) {
    await db.collection("socials").insertMany(socials);
  }
  return socials;
}

// Full Portfolio Snapshot
export async function getAllPortfolioData() {
  const [profile, projects, skills, certifications, experience, timeline, socials] = await Promise.all([
    getProfileData(),
    getProjectsData(),
    getSkillsData(),
    getCertificationsData(),
    getExperienceData(),
    getTimelineData(),
    getSocialsData(),
  ]);

  return {
    profile,
    projects,
    skills,
    certifications,
    experience,
    timeline,
    socials,
  };
}

// Database Seeder
export async function seedDatabase(force = false) {
  const db = await getDatabase();
  if (!db) {
    throw new Error("Cannot seed database: MongoDB connection unavailable. Please check your MONGODB_URI in .env.local");
  }

  const results: Record<string, string> = {};

  // 1. Profile
  const profileCount = await db.collection("profile").countDocuments();
  if (profileCount === 0 || force) {
    await db.collection("profile").deleteMany({});
    await db.collection("profile").insertOne({ ...defaultProfile });
    results.profile = "Seeded";
  } else {
    results.profile = "Already populated";
  }

  // 2. Projects
  const projectsCount = await db.collection("projects").countDocuments();
  if (projectsCount === 0 || force) {
    await db.collection("projects").deleteMany({});
    await db.collection("projects").insertMany(defaultProjects.map(p => ({ ...p })));
    results.projects = `Seeded ${defaultProjects.length} projects`;
  } else {
    results.projects = "Already populated";
  }

  // 3. Skills
  const skillsCount = await db.collection("skills").countDocuments();
  if (skillsCount === 0 || force) {
    await db.collection("skills").deleteMany({});
    await db.collection("skills").insertOne({ ...defaultSkills });
    results.skills = "Seeded";
  } else {
    results.skills = "Already populated";
  }

  // 4. Certifications
  const certsCount = await db.collection("certifications").countDocuments();
  if (certsCount === 0 || force) {
    await db.collection("certifications").deleteMany({});
    await db.collection("certifications").insertMany(defaultCertifications.map(c => ({ ...c })));
    results.certifications = `Seeded ${defaultCertifications.length} certifications`;
  } else {
    results.certifications = "Already populated";
  }

  // 5. Experience
  const expCount = await db.collection("experience").countDocuments();
  if (expCount === 0 || force) {
    await db.collection("experience").deleteMany({});
    await db.collection("experience").insertOne({ ...defaultExperience });
    results.experience = "Seeded";
  } else {
    results.experience = "Already populated";
  }

  // 6. Timeline
  const timelineCount = await db.collection("timeline").countDocuments();
  if (timelineCount === 0 || force) {
    await db.collection("timeline").deleteMany({});
    await db.collection("timeline").insertMany(defaultTimeline.map(t => ({ ...t })));
    results.timeline = `Seeded ${defaultTimeline.length} timeline items`;
  } else {
    results.timeline = "Already populated";
  }

  // 7. Socials
  const socialsCount = await db.collection("socials").countDocuments();
  if (socialsCount === 0 || force) {
    await db.collection("socials").deleteMany({});
    await db.collection("socials").insertMany(defaultSocials.map(s => ({ ...s })));
    results.socials = `Seeded ${defaultSocials.length} social items`;
  } else {
    results.socials = "Already populated";
  }

  return results;
}
