const Campaign = require("../models/Campaign");
const Audience = require("../models/Audience");
const Message = require("../models/Message");
const { sendEmail } = require("./emailService");

const executeCampaign = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId).populate("targetAudience");

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const audience = campaign.targetAudience;

    if (!audience) {
      throw new Error("Target audience not found");
    }

    console.log("====================================");
    console.log("EXECUTING CAMPAIGN:", campaign.name);
    console.log("AUDIENCE:", audience.name);
    console.log("CHANNEL:", campaign.channel);
    console.log("====================================");

    /*
      Audience model may contain recipients.
      We will safely check the available structure first.
    */

    const recipients =
      audience.members ||
      audience.contacts ||
      audience.recipients ||
      [];

    if (!recipients.length) {
      console.log("No recipients found in target audience.");

      await Campaign.findByIdAndUpdate(campaignId, {
        status: "completed",
      });

      return {
        success: true,
        message: "Campaign completed. No recipients found.",
        sent: 0,
      };
    }

    let sentCount = 0;

    for (const recipient of recipients) {
      const recipientName =
        recipient.name || recipient.fullName || "Audience Member";

      const recipientContact =
        recipient.email ||
        recipient.phone ||
        recipient.contact ||
        "";

      if (!recipientContact) {
        continue;
      }

      const message = await Message.create({
        campaign: campaign._id,
        audience: audience._id,
        recipientName,
        recipientContact,
        channel: campaign.channel,
        language: campaign.language,
        message: campaign.message,
        status: "pending",
      });

      try {
        if (
          campaign.channel === "email" &&
          recipient.email
        ) {
          await sendEmail({
            to: recipient.email,
            subject: campaign.name,
            text: campaign.message,
          });

          message.status = "sent";
          message.sentAt = new Date();
          await message.save();

          sentCount++;

          console.log(
            "EMAIL SENT TO:",
            recipient.email
          );
        } else {
          console.log(
            "CHANNEL NOT INTEGRATED:",
            campaign.channel
          );
        }
      } catch (error) {
        message.status = "failed";
        message.errorMessage = error.message;

        await message.save();

        console.error(
          "MESSAGE FAILED:",
          error.message
        );
      }
    }

    await Campaign.findByIdAndUpdate(campaignId, {
      status: "completed",
    });

    console.log(
      `CAMPAIGN COMPLETED. SENT: ${sentCount}`
    );

    return {
      success: true,
      sent: sentCount,
    };
  } catch (error) {
    console.error(
      "Campaign execution error:",
      error
    );

    throw error;
  }
};

module.exports = {
  executeCampaign,
};