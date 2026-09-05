const Campaign = require("../models/Campaign");
const Message = require("../models/Message");
const Audience = require("../models/Audience");
const Translation = require("../models/Translation");

const getAnalytics = async (req, res) => {
  try {
    const [
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      scheduledCampaigns,

      totalMessages,
      sentMessages,
      deliveredMessages,
      failedMessages,
      pendingMessages,

      totalAudiences,
      totalTranslations,
    ] = await Promise.all([
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: "active" }),
      Campaign.countDocuments({ status: "completed" }),
      Campaign.countDocuments({ status: "scheduled" }),

      Message.countDocuments(),
      Message.countDocuments({ status: "sent" }),
      Message.countDocuments({ status: "delivered" }),
      Message.countDocuments({ status: "failed" }),
      Message.countDocuments({ status: "pending" }),

      Audience.countDocuments(),
      Translation.countDocuments(),
    ]);

    // ==========================================
    // DELIVERY RATE
    // ==========================================
    const deliveryRate =
      totalMessages > 0
        ? (
            (deliveredMessages / totalMessages) *
            100
          ).toFixed(1)
        : "0.0";

    // ==========================================
    // MESSAGE BY CHANNEL
    // ==========================================
    const messageByChannel =
      await Message.aggregate([
        {
          $group: {
            _id: "$channel",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]);

    // ==========================================
    // MESSAGE BY LANGUAGE
    // ==========================================
    const messageByLanguage =
      await Message.aggregate([
        {
          $group: {
            _id: "$language",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]);

    // ==========================================
    // TRANSLATION BY LANGUAGE
    // ==========================================
    const translationByLanguage =
      await Translation.aggregate([
        {
          $group: {
            _id: "$targetLanguage",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]);

    // ==========================================
    // CAMPAIGN PERFORMANCE
    // ==========================================
    const campaignPerformance =
      await Campaign.aggregate([
        {
          $lookup: {
            from: "messages",
            localField: "_id",
            foreignField: "campaign",
            as: "messages",
          },
        },
        {
          $project: {
            name: 1,
            objective: 1,
            language: 1,
            channel: 1,
            status: 1,
            scheduledAt: 1,

            totalMessages: {
              $size: "$messages",
            },

            sentMessages: {
              $size: {
                $filter: {
                  input: "$messages",
                  as: "msg",
                  cond: {
                    $eq: [
                      "$$msg.status",
                      "sent",
                    ],
                  },
                },
              },
            },

            deliveredMessages: {
              $size: {
                $filter: {
                  input: "$messages",
                  as: "msg",
                  cond: {
                    $eq: [
                      "$$msg.status",
                      "delivered",
                    ],
                  },
                },
              },
            },

            failedMessages: {
              $size: {
                $filter: {
                  input: "$messages",
                  as: "msg",
                  cond: {
                    $eq: [
                      "$$msg.status",
                      "failed",
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

    // ==========================================
    // AUDIENCE REACH
    // ==========================================
    const audienceReach =
      await Audience.aggregate([
        {
          $project: {
            name: 1,
            language: 1,
            location: 1,
            occupation: 1,
            age: 1,
            gender: 1,

            recipientCount: {
              $size: {
                $ifNull: [
                  "$recipients",
                  [],
                ],
              },
            },
          },
        },
        {
          $sort: {
            recipientCount: -1,
          },
        },
      ]);

    // ==========================================
    // TOTAL RECIPIENTS
    // ==========================================
    const recipientStats =
      await Audience.aggregate([
        {
          $project: {
            recipientCount: {
              $size: {
                $ifNull: [
                  "$recipients",
                  [],
                ],
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRecipients: {
              $sum: "$recipientCount",
            },
          },
        },
      ]);

    const totalRecipients =
      recipientStats.length > 0
        ? recipientStats[0].totalRecipients
        : 0;

    // ==========================================
    // RESPONSE
    // ==========================================
    res.status(200).json({
      role: req.user.role,

      overview: {
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        scheduledCampaigns,

        totalMessages,
        sentMessages,
        deliveredMessages,
        failedMessages,
        pendingMessages,

        totalAudiences,
        totalRecipients,
        totalTranslations,

        deliveryRate: `${deliveryRate}%`,
      },

      messageByChannel,
      messageByLanguage,
      translationByLanguage,

      campaignPerformance,
      audienceReach,
    });
  } catch (error) {
    console.error(
      "Analytics error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getAnalytics,
};