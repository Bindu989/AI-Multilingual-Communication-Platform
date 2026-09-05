const Campaign = require("../models/Campaign");
const { executeCampaign } = require("../services/campaignExecutionService");

// ==========================================
// CREATE CAMPAIGN
// ==========================================
const createCampaign = async (req, res) => {
  try {
    const {
      name,
      objective,
      message,
      language,
      channel,
      targetAudience,
      scheduledAt
    } = req.body;

    if (
      !name ||
      !objective ||
      !message ||
      !language ||
      !channel ||
      !targetAudience
    ) {
      return res.status(400).json({
        message: "All required campaign fields must be provided"
      });
    }

    const campaign = await Campaign.create({
      name,
      objective,
      message,
      language,
      channel,
      targetAudience,
      scheduledAt: scheduledAt || null
    });

    res.status(201).json({
      message: "Campaign created successfully",
      campaign
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create campaign",
      error: error.message
    });
  }
};


// ==========================================
// GET ALL CAMPAIGNS
// ==========================================
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate("targetAudience")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Campaigns fetched successfully",
      count: campaigns.length,
      campaigns
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch campaigns",
      error: error.message
    });
  }
};


// ==========================================
// GET SINGLE CAMPAIGN
// ==========================================
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("targetAudience");

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found"
      });
    }

    res.status(200).json({
      message: "Campaign fetched successfully",
      campaign
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch campaign",
      error: error.message
    });
  }
};


// ==========================================
// UPDATE CAMPAIGN
// ==========================================
const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate("targetAudience");

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found"
      });
    }

    res.status(200).json({
      message: "Campaign updated successfully",
      campaign
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update campaign",
      error: error.message
    });
  }
};


// ==========================================
// DELETE CAMPAIGN
// ==========================================
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found"
      });
    }

    res.status(200).json({
      message: "Campaign deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete campaign",
      error: error.message
    });
  }
};


// ==========================================
// RUN CAMPAIGN MANUALLY
// ==========================================
const runCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found"
      });
    }

    if (campaign.status === "completed") {
      return res.status(400).json({
        message: "Campaign has already been completed"
      });
    }

    // Mark campaign as active
    await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        status: "active"
      }
    );

    // Execute campaign
    const result = await executeCampaign(req.params.id);

    res.status(200).json({
      message: "Campaign executed successfully",
      campaignId: req.params.id,
      result
    });

  } catch (error) {
    console.error("Run campaign error:", error);

    res.status(500).json({
      message: "Failed to execute campaign",
      error: error.message
    });
  }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  runCampaign
};