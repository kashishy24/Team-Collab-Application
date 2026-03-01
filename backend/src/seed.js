/**
 * Demo seed: 3 teams, 5 members each (mixed roles), 2-3 projects per team.
 * Run: npm run seed (from backend folder)
 * All demo users password: password123
 *
 * Teams & logins:
 * - Alpha Team:   alpha.admin@demo.com (ADMIN)
 * - Beta Squad:   beta.admin@teamcollab.com (ADMIN)
 * - Gamma Labs:   gamma.admin@demo.com (ADMIN)
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Team, Project, Task, Message } from './models/index.js';

dotenv.config();

const DEMO_PASSWORD = 'password123';

const TEAMS = [
  {
    name: 'Alpha Team',
    description: 'Product and engineering',
    members: [
      { name: 'Alex Admin', email: 'alpha.admin@demo.com', role: 'ADMIN' },
      { name: 'Morgan Manager', email: 'alpha.manager1@demo.com', role: 'MANAGER' },
      { name: 'Sam Lead', email: 'alpha.manager2@teamcollab.com', role: 'MANAGER' },
      { name: 'Jordan Dev', email: 'alpha.member1@teamcollab.com', role: 'MEMBER' },
      { name: 'Casey Dev', email: 'alpha.member2@teamcollab.com', role: 'MEMBER' },
    ],
    projects: [
      { name: 'Website Redesign', description: 'Modernize the company website' },
      { name: 'API v2', description: 'REST API redesign and documentation' },
      { name: 'Mobile App', description: 'iOS and Android app' },
    ],
  },
  {
    name: 'Beta Squad',
    description: 'Marketing and growth',
    members: [
      { name: 'Blake Admin', email: 'beta.admin@teamcollab.com', role: 'ADMIN' },
      { name: 'Riley Manager', email: 'beta.manager1@teamcollab.com', role: 'MANAGER' },
      { name: 'Avery Designer', email: 'beta.member1@demo.com', role: 'MEMBER' },
      { name: 'Quinn Copy', email: 'beta.member2@demo.com', role: 'MEMBER' },
      { name: 'Parker Analyst', email: 'beta.member3@demo.com', role: 'MEMBER' },
    ],
    projects: [
      { name: 'Q1 Campaign', description: 'Launch campaign and social' },
      { name: 'Brand Refresh', description: 'New logo and guidelines' },
    ],
  },
  {
    name: 'Gamma Labs',
    description: 'Research and data',
    members: [
      { name: 'Taylor Admin', email: 'gamma.admin@demo.com', role: 'ADMIN' },
      { name: 'Drew Manager', email: 'gamma.manager1@demo.com', role: 'MANAGER' },
      { name: 'Sage Researcher', email: 'gamma.member1@demo.com', role: 'MEMBER' },
      { name: 'River Engineer', email: 'gamma.member2@demo.com', role: 'MEMBER' },
      { name: 'Skyler Data', email: 'gamma.member3@demo.com', role: 'MEMBER' },
    ],
    projects: [
      { name: 'Data Pipeline', description: 'ETL and analytics pipeline' },
      { name: 'A/B Framework', description: 'Experimentation platform' },
      { name: 'Reports Dashboard', description: 'Internal reporting' },
    ],
  },
];

const TASK_TITLES = [
  'Setup project repo',
  'Write technical spec',
  'Design mockups',
  'Implement API',
  'Code review',
  'Update docs',
  'Deploy to staging',
  'QA testing',
  'Launch',
  'Retrospective',
];

function pickStatus() {
  const r = Math.random();
  if (r < 0.35) return 'todo';
  if (r < 0.75) return 'in-progress';
  return 'done';
}

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamcollab';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  try {
    await mongoose.connection.db.collection('users').dropIndex('firebaseUid_1');
    console.log('Dropped old firebaseUid_1 index');
  } catch (e) {
    if (e.code !== 27 && e.code !== 26)
      console.log('(firebaseUid_1 index not present or already dropped)');
  }

  for (const teamSpec of TEAMS) {
    const adminSpec = teamSpec.members[0];
    let admin = await User.findOne({ email: adminSpec.email });

    if (!admin) {
      admin = await User.create({
        name: adminSpec.name,
        email: adminSpec.email,
        password: DEMO_PASSWORD,
        role: adminSpec.role,
      });
      console.log('  User:', admin.email, adminSpec.role);
    }

    let team = await Team.findOne({ name: teamSpec.name });
    if (!team) {
      team = await Team.create({
        name: teamSpec.name,
        description: teamSpec.description,
        adminId: admin._id,
      });
      console.log('Team:', team.name);
    }

    admin.teamId = team._id;
    admin.role = adminSpec.role;
    await admin.save();

    const members = [admin];

    for (let i = 1; i < teamSpec.members.length; i++) {
      const m = teamSpec.members[i];
      let user = await User.findOne({ email: m.email });

      if (!user) {
        user = await User.create({
          name: m.name,
          email: m.email,
          password: DEMO_PASSWORD,
          role: m.role,
          teamId: team._id,
        });
        console.log('  User:', user.email, m.role);
      } else if (!user.teamId) {
        user.teamId = team._id;
        user.role = m.role;
        await user.save();
      }

      members.push(user);
    }

    const projects = [];

    for (const p of teamSpec.projects) {
      let proj = await Project.findOne({ teamId: team._id, name: p.name });
      if (!proj) {
        proj = await Project.create({ ...p, teamId: team._id });
        console.log('  Project:', proj.name);
      }
      projects.push(proj);
    }

    for (let pi = 0; pi < projects.length; pi++) {
      const project = projects[pi];
      const numTasks = 3 + Math.floor(Math.random() * 3);

      for (let ti = 0; ti < numTasks; ti++) {
        const title =
          TASK_TITLES[(pi * 3 + ti) % TASK_TITLES.length] +
          ` (${project.name})`;

        const exists = await Task.findOne({
          projectId: project._id,
          title,
        });

        if (!exists) {
          const assignee =
            members[Math.floor(Math.random() * members.length)]._id;

          await Task.create({
            title,
            description: '',
            status: pickStatus(),
            projectId: project._id,
            assignedTo: Math.random() > 0.3 ? assignee : null,
            order: ti + 1,
          });
        }
      }
    }

    console.log('  Tasks created for', projects.length, 'projects');

    const greetings = [
      `Welcome to ${teamSpec.name}!`,
      'Kickoff meeting scheduled for tomorrow.',
      'Please check the Kanban board for your tasks.',
    ];

    for (const content of greetings) {
      const exists = await Message.findOne({
        teamId: team._id,
        content,
      });

      if (!exists) {
        const sender =
          members[Math.floor(Math.random() * members.length)];

        await Message.create({
          content,
          senderId: sender._id,
          teamId: team._id,
          timestamp: new Date(),
        });
      }
    }

    console.log('  Messages added\n');
  }

  console.log('Demo seed completed.');
  console.log('Log in with any demo user; password for all:', DEMO_PASSWORD);
  console.log('Example login: alpha.admin@demo.com / password123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});