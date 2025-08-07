const FAQ=require("../Models/Faq")
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer} = req.body;
    const faq = await FAQ.create({ question, answer});
    res.status(201).json({ success: true, message: 'FAQ created', data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create FAQ', error: err.message });
  }
};

// Get all active FAQs
exports.getAllActiveFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch FAQs', error: err.message });
  }
};

// Get single FAQ by ID
exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.status(200).json({ success: true, data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch FAQ', error: err.message });
  }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const { question, answer, isActive } = req.body;
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question, answer, isActive },
      { new: true }
    );
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.status(200).json({ success: true, message: 'FAQ updated', data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update FAQ', error: err.message });
  }
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.status(200).json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete FAQ', error: err.message });
  }
};
