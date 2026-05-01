// ============================================================
// seed.js — Seed script for Team Task Manager
// Run: node seed.js
// Make sure your .env is configured with MONGO_URI first!
// ============================================================

const mongoose = require("mongoose");
const dotenv   = require("dotenv");
const bcrypt   = require("bcryptjs");

dotenv.config();

// ── Import Models ─────────────────────────────────────────────
const User    = require("./models/User");
const Project = require("./models/Project");
const Task    = require("./models/Task");

// ── Seed Data ─────────────────────────────────────────────────

const USERS = [
  {
    name:     "Alice Admin",
    email:    "admin@teamflow.com",
    password: "admin123",
    role:     "ADMIN",
  },
  {
    name:     "Bob Member",
    email:    "member@teamflow.com",
    password: "member123",
    role:     "MEMBER",
  },
  {
    name:     "Carol Dev",
    email:    "carol@teamflow.com",
    password: "carol123",
    role:     "MEMBER",
  },
  {
    name:     "David Designer",
    email:    "david@teamflow.com",
    password: "david123",
    role:     "MEMBER",
  },
];

// ── Main seed function ────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ── Wipe existing data ────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
    ]);
    console.log("🗑  Cleared existing data");

    // ── Create Users (password hashing via model hook) ────────
    const createdUsers = await User.create(USERS);
    const [admin, bob, carol, david] = createdUsers;
    console.log(`👤 Created ${createdUsers.length} users`);

    // ── Create Projects ───────────────────────────────────────
    const projects = await Project.create([
      {
        name:        "Website Redesign",
        description: "Full redesign of the company website with new branding and improved UX.",
        createdBy:   admin._id,
        members:     [bob._id, carol._id, david._id],
      },
      {
        name:        "Mobile App v2.0",
        description: "Second version of the mobile app with offline support and push notifications.",
        createdBy:   admin._id,
        members:     [bob._id, carol._id],
      },
      {
        name:        "Marketing Campaign Q2",
        description: "Q2 digital marketing campaign across social, email, and paid channels.",
        createdBy:   admin._id,
        members:     [david._id, bob._id],
      },
    ]);

    const [websiteProject, mobileProject, marketingProject] = projects;
    console.log(`📁 Created ${projects.length} projects`);

    // Add project refs to users
    await User.findByIdAndUpdate(bob._id,   { projects: [websiteProject._id, mobileProject._id, marketingProject._id] });
    await User.findByIdAndUpdate(carol._id, { projects: [websiteProject._id, mobileProject._id] });
    await User.findByIdAndUpdate(david._id, { projects: [websiteProject._id, marketingProject._id] });

    // ── Create Tasks ──────────────────────────────────────────
    const today   = new Date();
    const past    = (d) => new Date(today.getTime() - d * 24 * 60 * 60 * 1000);
    const future  = (d) => new Date(today.getTime() + d * 24 * 60 * 60 * 1000);

    await Task.create([
      // ── Website Redesign tasks ────────────────────────────
      {
        title:       "Create wireframes for homepage",
        description: "Design low-fidelity wireframes for the new homepage layout in Figma.",
        status:      "Done",
        dueDate:     past(10),
        project:     websiteProject._id,
        assignedTo:  david._id,
        createdBy:   admin._id,
      },
      {
        title:       "Set up React project structure",
        description: "Bootstrap the new frontend with Vite, Tailwind, and folder structure.",
        status:      "Done",
        dueDate:     past(7),
        project:     websiteProject._id,
        assignedTo:  carol._id,
        createdBy:   admin._id,
      },
      {
        title:       "Implement responsive navbar",
        description: "Build the main navigation component with mobile hamburger menu.",
        status:      "In-Progress",
        dueDate:     future(3),
        project:     websiteProject._id,
        assignedTo:  carol._id,
        createdBy:   admin._id,
      },
      {
        title:       "Design new color system & typography",
        description: "Define CSS variables, color palette, font pairings, and spacing scale.",
        status:      "In-Progress",
        dueDate:     future(5),
        project:     websiteProject._id,
        assignedTo:  david._id,
        createdBy:   admin._id,
      },
      {
        title:       "Write copy for About page",
        description: "Draft new team bios and company story for the About section.",
        status:      "Todo",
        dueDate:     future(8),
        project:     websiteProject._id,
        assignedTo:  bob._id,
        createdBy:   admin._id,
      },
      {
        title:       "Integrate contact form with backend",
        description: "Connect the contact form to the API and set up email notifications.",
        status:      "Todo",
        dueDate:     future(12),
        project:     websiteProject._id,
        assignedTo:  carol._id,
        createdBy:   admin._id,
      },
      {
        title:       "SEO audit and meta tags",
        description: "Review all pages for proper meta tags, OG images, and structured data.",
        status:      "Todo",
        dueDate:     past(2), // OVERDUE
        project:     websiteProject._id,
        assignedTo:  bob._id,
        createdBy:   admin._id,
      },

      // ── Mobile App v2.0 tasks ─────────────────────────────
      {
        title:       "Set up offline-first architecture",
        description: "Implement local SQLite storage with sync strategy for offline support.",
        status:      "In-Progress",
        dueDate:     future(6),
        project:     mobileProject._id,
        assignedTo:  carol._id,
        createdBy:   admin._id,
      },
      {
        title:       "Push notification service integration",
        description: "Integrate Firebase Cloud Messaging for iOS and Android push notifications.",
        status:      "Todo",
        dueDate:     future(10),
        project:     mobileProject._id,
        assignedTo:  bob._id,
        createdBy:   admin._id,
      },
      {
        title:       "Redesign onboarding flow",
        description: "Create new 3-step onboarding screens with animations.",
        status:      "Done",
        dueDate:     past(5),
        project:     mobileProject._id,
        assignedTo:  carol._id,
        createdBy:   admin._id,
      },
      {
        title:       "Performance profiling & optimisation",
        description: "Profile app with Flipper, reduce bundle size, fix memory leaks.",
        status:      "Todo",
        dueDate:     past(1), // OVERDUE
        project:     mobileProject._id,
        assignedTo:  bob._id,
        createdBy:   admin._id,
      },

      // ── Marketing Campaign Q2 tasks ───────────────────────
      {
        title:       "Write Q2 email newsletter",
        description: "Draft HTML email newsletter for Q2 product update, 500-word limit.",
        status:      "Done",
        dueDate:     past(8),
        project:     marketingProject._id,
        assignedTo:  bob._id,
        createdBy:   admin._id,
      },
      {
        title:       "Design social media banner set",
        description: "Create 10 banner variations for LinkedIn, Twitter, and Instagram.",
        status:      "In-Progress",
        dueDate:     future(4),
        project:     marketingProject._id,
        assignedTo:  david._id,
        createdBy:   admin._id,
      },
      {
        title:       "Set up Google Ads campaign",
        description: "Configure keyword targeting, ad copy, and $2000 monthly budget.",
        status:      "Todo",
        dueDate:     future(7),
        project:     marketingProject._id,
        assignedTo:  bob._id,
        createdBy:   admin._id,
      },
      {
        title:       "A/B test landing page headlines",
        description: "Run 2-week A/B test on 3 headline variants using Google Optimize.",
        status:      "Todo",
        dueDate:     past(3), // OVERDUE
        project:     marketingProject._id,
        assignedTo:  david._id,
        createdBy:   admin._id,
      },
    ]);

    console.log("✅ Created 15 tasks (including 3 overdue)");

    // ── Summary ───────────────────────────────────────────────
    console.log("\n========================================");
    console.log("  🌱 Seed complete! Login credentials:");
    console.log("========================================");
    console.log("  ADMIN   → admin@teamflow.com  / admin123");
    console.log("  MEMBER  → member@teamflow.com / member123");
    console.log("  MEMBER  → carol@teamflow.com  / carol123");
    console.log("  MEMBER  → david@teamflow.com  / david123");
    console.log("========================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
