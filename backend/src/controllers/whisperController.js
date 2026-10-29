import { AnonymousChat } from '../models/AnonymousChat.js';

export const getActiveChats = async (req, res, next) => {
  try {
    const chats = await AnonymousChat.find({ status: { $in: ['Waiting', 'Active'] } })
      .select('-messages') // Exclude messages for privacy in the list view
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: chats.length, data: chats });
  } catch (error) {
    next(error);
  }
};

export const createChat = async (req, res, next) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const newChat = await AnonymousChat.create({
      topic,
      status: 'Waiting',
      messages: []
    });

    res.status(201).json({ success: true, data: newChat });
  } catch (error) {
    next(error);
  }
};

export const joinChat = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const chat = await AnonymousChat.findById(id);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    if (chat.status === 'Waiting') {
      chat.status = 'Active';
      await chat.save();
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chat = await AnonymousChat.findById(id);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    res.status(200).json({ success: true, data: chat.messages });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ success: false, message: 'Message content required' });

    const chat = await AnonymousChat.findById(id);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    chat.messages.push({
      sender: req.user.role || 'User',
      content,
      timestamp: new Date()
    });

    await chat.save();
    res.status(200).json({ success: true, data: chat.messages });
  } catch (error) {
    next(error);
  }
};
