const Audience = require("../models/Audience");

// ==========================================
// CREATE AUDIENCE
// ==========================================
const createAudience = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      location,
      language,
      occupation,
      engagementHistory,
      recipients,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      age === undefined ||
      age === null ||
      !gender ||
      !location ||
      !language ||
      !occupation
    ) {
      return res.status(400).json({
        message: "All required audience fields must be provided",
      });
    }

    // Validate age
    const numericAge = Number(age);

    if (
      Number.isNaN(numericAge) ||
      numericAge < 1 ||
      numericAge > 120
    ) {
      return res.status(400).json({
        message: "Age must be a valid number between 1 and 120",
      });
    }

    // Validate gender
    const allowedGenders = [
      "male",
      "female",
      "other",
    ];

    if (!allowedGenders.includes(gender)) {
      return res.status(400).json({
        message:
          "Gender must be male, female, or other",
      });
    }

    const audience = await Audience.create({
      name: name.trim(),
      age: numericAge,
      gender,
      location: location.trim(),
      language: language.trim(),
      occupation: occupation.trim(),
      engagementHistory:
        engagementHistory?.trim() ||
        "No previous engagement",
      recipients: Array.isArray(recipients)
        ? recipients
        : [],
    });

    res.status(201).json({
      message: "Audience created successfully",
      audience,
    });
  } catch (error) {
    console.error(
      "Create audience error:",
      error
    );

    res.status(500).json({
      message: "Failed to create audience",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL AUDIENCES
// ==========================================
const getAudiences = async (req, res) => {
  try {
    const audiences = await Audience.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: audiences.length,
      audiences,
    });
  } catch (error) {
    console.error(
      "Get audiences error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch audiences",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE AUDIENCE
// ==========================================
const getAudienceById = async (req, res) => {
  try {
    const audience =
      await Audience.findById(
        req.params.id
      );

    if (!audience) {
      return res.status(404).json({
        message: "Audience not found",
      });
    }

    res.status(200).json({
      audience,
    });
  } catch (error) {
    console.error(
      "Get audience by id error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch audience",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE AUDIENCE
// ==========================================
const updateAudience = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      location,
      language,
      occupation,
      engagementHistory,
    } = req.body;

    // Build update object only with fields provided
    const updateData = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Audience name cannot be empty",
        });
      }

      updateData.name = name.trim();
    }

    if (age !== undefined) {
      const numericAge = Number(age);

      if (
        Number.isNaN(numericAge) ||
        numericAge < 1 ||
        numericAge > 120
      ) {
        return res.status(400).json({
          message:
            "Age must be a valid number between 1 and 120",
        });
      }

      updateData.age = numericAge;
    }

    if (gender !== undefined) {
      const allowedGenders = [
        "male",
        "female",
        "other",
      ];

      if (!allowedGenders.includes(gender)) {
        return res.status(400).json({
          message:
            "Gender must be male, female, or other",
        });
      }

      updateData.gender = gender;
    }

    if (location !== undefined) {
      if (!location.trim()) {
        return res.status(400).json({
          message: "Location cannot be empty",
        });
      }

      updateData.location =
        location.trim();
    }

    if (language !== undefined) {
      if (!language.trim()) {
        return res.status(400).json({
          message: "Language cannot be empty",
        });
      }

      updateData.language =
        language.trim();
    }

    if (occupation !== undefined) {
      if (!occupation.trim()) {
        return res.status(400).json({
          message:
            "Occupation cannot be empty",
        });
      }

      updateData.occupation =
        occupation.trim();
    }

    if (
      engagementHistory !== undefined
    ) {
      updateData.engagementHistory =
        engagementHistory.trim();
    }

    const audience =
      await Audience.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!audience) {
      return res.status(404).json({
        message: "Audience not found",
      });
    }

    res.status(200).json({
      message: "Audience updated successfully",
      audience,
    });
  } catch (error) {
    console.error(
      "Update audience error:",
      error
    );

    res.status(500).json({
      message: "Failed to update audience",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE AUDIENCE
// ==========================================
const deleteAudience = async (req, res) => {
  try {
    const audience =
      await Audience.findByIdAndDelete(
        req.params.id
      );

    if (!audience) {
      return res.status(404).json({
        message: "Audience not found",
      });
    }

    res.status(200).json({
      message:
        "Audience deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete audience error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete audience",
      error: error.message,
    });
  }
};

// ==========================================
// ADD RECIPIENT
// ==========================================
const addRecipient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message:
          "Recipient name is required",
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        message:
          "Recipient email or phone is required",
      });
    }

    const audience =
      await Audience.findById(
        req.params.id
      );

    if (!audience) {
      return res.status(404).json({
        message: "Audience not found",
      });
    }

    const recipient = {
      name: name.trim(),
      email: email
        ? email.trim().toLowerCase()
        : undefined,
      phone: phone
        ? phone.trim()
        : undefined,
    };

    audience.recipients.push(recipient);

    await audience.save();

    const addedRecipient =
      audience.recipients[
        audience.recipients.length - 1
      ];

    res.status(201).json({
      message:
        "Recipient added successfully",
      audience,
      recipient: addedRecipient,
    });
  } catch (error) {
    console.error(
      "Add recipient error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to add recipient",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE RECIPIENT
// ==========================================
const updateRecipient = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      phone,
    } = req.body;

    const audience =
      await Audience.findById(
        req.params.id
      );

    if (!audience) {
      return res.status(404).json({
        message: "Audience not found",
      });
    }

    const recipient =
      audience.recipients.id(
        req.params.recipientId
      );

    if (!recipient) {
      return res.status(404).json({
        message:
          "Recipient not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message:
            "Recipient name cannot be empty",
        });
      }

      recipient.name =
        name.trim();
    }

    if (email !== undefined) {
      recipient.email =
        email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      recipient.phone =
        phone.trim();
    }

    if (
      !recipient.email &&
      !recipient.phone
    ) {
      return res.status(400).json({
        message:
          "Recipient must have an email or phone",
      });
    }

    await audience.save();

    res.status(200).json({
      message:
        "Recipient updated successfully",
      audience,
      recipient,
    });
  } catch (error) {
    console.error(
      "Update recipient error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update recipient",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE RECIPIENT
// ==========================================
const deleteRecipient = async (
  req,
  res
) => {
  try {
    const audience =
      await Audience.findById(
        req.params.id
      );

    if (!audience) {
      return res.status(404).json({
        message: "Audience not found",
      });
    }

    const recipient =
      audience.recipients.id(
        req.params.recipientId
      );

    if (!recipient) {
      return res.status(404).json({
        message:
          "Recipient not found",
      });
    }

    recipient.deleteOne();

    await audience.save();

    res.status(200).json({
      message:
        "Recipient deleted successfully",
      audience,
    });
  } catch (error) {
    console.error(
      "Delete recipient error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete recipient",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  createAudience,
  getAudiences,
  getAudienceById,
  updateAudience,
  deleteAudience,
  addRecipient,
  updateRecipient,
  deleteRecipient,
};