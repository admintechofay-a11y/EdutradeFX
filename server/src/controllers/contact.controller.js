const { ContactEnquiry } = require('../models');

// @desc    Submit a contact enquiry
// @route   POST /api/contact
// @access  Public
exports.createContactEnquiry = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message',
      });
    }

    const enquiry = await ContactEnquiry.create({
      name,
      email,
      phone: phone || '',
      message,
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Contact enquiry submitted successfully',
      data: enquiry,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all contact enquiries
// @route   GET /api/contact
// @access  Private (Admin)
exports.getContactEnquiries = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ContactEnquiry.countDocuments(query);
    const enquiries = await ContactEnquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: enquiries.length,
      total,
      data: enquiries,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
