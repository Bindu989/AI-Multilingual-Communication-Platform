const Message = require("../models/Message");
const Campaign = require("../models/Campaign");
const Audience = require("../models/Audience");
const { sendEmail } = require("../services/emailService");

// ==========================================
// CREATE MESSAGE
// ==========================================
const createMessage = async (req, res) => {
  try {
    const {
      campaign,
      audience,
      recipientName,
      recipientContact,
      channel,
      language,
      message,
    } = req.body;

    // Required field validation
    if (
      !campaign ||
      !audience ||
      !recipientName ||
      !recipientContact ||
      !channel ||
      !language ||
      !message
    ) {
      return res.status(400).json({
        message:
          "All required message fields must be provided",
      });
    }

    // Validate campaign
    const campaignExists =
      await Campaign.findById(campaign);

    if (!campaignExists) {
      return res.status(404).json({
        message:
          "Selected campaign not found",
      });
    }

    // Validate audience
    const audienceExists =
      await Audience.findById(audience);

    if (!audienceExists) {
      return res.status(404).json({
        message:
          "Selected audience not found",
      });
    }

    // Validate channel
    const allowedChannels = [
      "sms",
      "email",
      "whatsapp",
      "push",
    ];

    if (!allowedChannels.includes(channel)) {
      return res.status(400).json({
        message:
          "Invalid communication channel",
      });
    }

    // Create message record
    const newMessage = await Message.create({
      campaign,
      audience,
      recipientName:
        recipientName.trim(),
      recipientContact:
        recipientContact.trim(),
      channel,
      language: language.trim(),
      message: message.trim(),
      status: "pending",
    });

    // ==========================================
    // EMAIL
    // ==========================================
    if (channel === "email") {
      try {
        const emailResult =
          await sendEmail({
            to: recipientContact.trim(),
            subject:
              `AI Multilingual Communication Platform - ${language} Message`,
            text: message,
          });

        const emailId =
          emailResult?.id;

        newMessage.status = "sent";
        newMessage.sentAt =
          new Date();
        newMessage.errorMessage = "";

        await newMessage.save();

        return res.status(201).json({
          message:
            "Email sent successfully",
          data: newMessage,
          emailMessageId:
            emailId,
        });
      } catch (emailError) {
        console.error(
          "Email sending failed:",
          emailError.message
        );

        newMessage.status = "failed";
        newMessage.errorMessage =
          emailError.message;

        await newMessage.save();

        return res.status(500).json({
          message:
            "Message created but email sending failed",
          error:
            emailError.message,
          data: newMessage,
        });
      }
    }

    // ==========================================
    // OTHER CHANNELS
    // ==========================================
    return res.status(201).json({
      message:
        "Message created successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error(
      "Create message error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        message:
          "Invalid message data",
        error: error.message,
      });
    }

    return res.status(500).json({
      message:
        "Failed to create message",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL MESSAGES
// ==========================================
const getMessages = async (req, res) => {
  try {
    const messages =
      await Message.find()
        .populate("campaign")
        .populate("audience")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      message:
        "Messages fetched successfully",
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error(
      "Get messages error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch messages",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE MESSAGE
// ==========================================
const getMessageById = async (
  req,
  res
) => {
  try {
    const message =
      await Message.findById(
        req.params.id
      )
        .populate("campaign")
        .populate("audience");

    if (!message) {
      return res.status(404).json({
        message:
          "Message not found",
      });
    }

    return res.status(200).json({
      message:
        "Message fetched successfully",
      data: message,
    });
  } catch (error) {
    console.error(
      "Get message error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch message",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE MESSAGE STATUS
// ==========================================
const updateMessageStatus =
  async (req, res) => {
    try {
      const {
        status,
        errorMessage,
      } = req.body;

      const allowedStatuses = [
        "pending",
        "sent",
        "delivered",
        "failed",
      ];

      if (
        status &&
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid message status",
        });
      }

      const updateData = {};

      if (status) {
        updateData.status = status;

        if (status === "sent") {
          updateData.sentAt =
            new Date();
        }

        if (
          status === "delivered"
        ) {
          updateData.deliveredAt =
            new Date();
        }

        if (status === "pending") {
          updateData.sentAt =
            undefined;

          updateData.deliveredAt =
            undefined;
        }
      }

      if (
        errorMessage !==
        undefined
      ) {
        updateData.errorMessage =
          errorMessage;
      }

      const updatedMessage =
        await Message.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            returnDocument:
              "after",
            runValidators: true,
          }
        )
          .populate("campaign")
          .populate("audience");

      if (!updatedMessage) {
        return res.status(404).json({
          message:
            "Message not found",
        });
      }

      return res.status(200).json({
        message:
          "Message status updated successfully",
        data: updatedMessage,
      });
    } catch (error) {
      console.error(
        "Update message status error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update message status",
        error: error.message,
      });
    }
  };

// ==========================================
// DELETE MESSAGE
// ==========================================
const deleteMessage = async (
  req,
  res
) => {
  try {
    const message =
      await Message.findByIdAndDelete(
        req.params.id
      );

    if (!message) {
      return res.status(404).json({
        message:
          "Message not found",
      });
    }

    return res.status(200).json({
      message:
        "Message deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete message error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete message",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
  createMessage,
  getMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
};