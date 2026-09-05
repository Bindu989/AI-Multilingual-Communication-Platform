const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const cron = require("node-cron");

const connectDB = require("./config/db");
const Campaign = require("./models/Campaign");
const {
  executeCampaign,
} = require("./services/campaignExecutionService");

// Connect MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const audienceRoutes = require("./routes/audienceRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const messageRoutes = require("./routes/messageRoutes");
const translationRoutes = require("./routes/translationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audiences", audienceRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/translations", translationRoutes);
app.use("/api/analytics", analyticsRoutes);

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "AI Multilingual Communication Platform Backend Running Successfully",
  });
});

// Campaign Scheduler
// Checks every minute for scheduled campaigns
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const campaigns = await Campaign.find({
      status: "scheduled",
      scheduledAt: { $lte: now },
    });

    if (campaigns.length > 0) {
      console.log(
        `SCHEDULER: ${campaigns.length} campaign(s) ready for execution`
      );
    }

    for (const campaign of campaigns) {
      try {
        console.log(
          "SCHEDULED CAMPAIGN FOUND:",
          campaign.name
        );

        // Mark campaign as active
        await Campaign.findByIdAndUpdate(
          campaign._id,
          {
            status: "active",
          }
        );

        // Execute campaign
        await executeCampaign(campaign._id);

        console.log(
          "CAMPAIGN EXECUTION SUCCESS:",
          campaign.name
        );
      } catch (campaignError) {
        console.error(
          "CAMPAIGN EXECUTION FAILED:",
          campaign.name,
          campaignError.message
        );
      }
    }
  } catch (error) {
    console.error(
      "Scheduler error:",
      error.message
    );
  }
});

// 404 route
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Campaign scheduler started");
});