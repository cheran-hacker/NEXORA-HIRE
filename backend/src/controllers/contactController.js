import { ContactMessage } from '../models/ContactMessage.js';

export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    next(error);
  }
};
