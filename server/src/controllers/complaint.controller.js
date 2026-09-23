const { Complaint } = require('../models');

// @desc    Submit a complaint
// @route   POST /api/complaints
// @access  Public
exports.createComplaint = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      company,
      category,
      description,
      documents,
      declaration,
    } = req.body;

    if (!name || !email || !company || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, company, and dispute description',
      });
    }

    if (!declaration) {
      return res.status(400).json({
        success: false,
        message: 'You must confirm the declaration of accuracy',
      });
    }

    let documentUrls = Array.isArray(documents)
      ? documents
      : documents
      ? [documents]
      : [];

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadedUrls = req.files.map((file) => file.path || file.secure_url);
      documentUrls = [...documentUrls, ...uploadedUrls];
    }

    const complaint = await Complaint.create({
      name,
      email,
      mobile: mobile || '',
      company,
      category: category || 'withdrawal_delay',
      description,
      documents: documentUrls,
      declaration: Boolean(declaration),
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully to the mediation desk',
      data: complaint,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Admin)
exports.getComplaints = async (req, res) => {
  try {
    const {
      status,
      category,
      company,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (company) query.company = { $regex: company, $options: 'i' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      data: complaints,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update complaint status and append internal notes
// @route   PATCH /api/complaints/:id
// @access  Private (Admin)
exports.updateComplaint = async (req, res) => {
  try {
    const { status, note } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) {
      complaint.status = status;
    }

    if (note && note.trim()) {
      complaint.internalNotes.push({
        note: note.trim(),
        addedBy: req.user.id,
        authorName: req.user.name || 'Compliance Officer',
        addedAt: new Date(),
      });
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
