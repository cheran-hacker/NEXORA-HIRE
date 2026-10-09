import { Snippet } from '../models/Snippet.js';

export const createSnippet = async (req, res, next) => {
  try {
    const { title, language, code, description } = req.body;
    
    const snippet = await Snippet.create({
      authorId: req.user.id,
      title,
      language,
      code,
      description
    });

    res.status(201).json({ success: true, data: snippet });
  } catch (error) {
    next(error);
  }
};

export const getSnippets = async (req, res, next) => {
  try {
    // We intentionally don't populate the authorId to keep it anonymous
    const snippets = await Snippet.find().sort('-createdAt');
    res.status(200).json({ success: true, count: snippets.length, data: snippets });
  } catch (error) {
    next(error);
  }
};

export const roastSnippet = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const snippetId = req.params.id;

    const snippet = await Snippet.findById(snippetId);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

    snippet.roasts.push({
      reviewerId: req.user.id,
      comment
    });

    await snippet.save();
    res.status(200).json({ success: true, data: snippet });
  } catch (error) {
    next(error);
  }
};

export const upvoteRoast = async (req, res, next) => {
  try {
    const { roastId } = req.body;
    const snippetId = req.params.id;
    const userId = req.user.id;

    const snippet = await Snippet.findById(snippetId);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

    const roast = snippet.roasts.id(roastId);
    if (!roast) return res.status(404).json({ message: 'Roast not found' });

    // Prevent double voting
    if (roast.upvotedBy.includes(userId)) {
      return res.status(400).json({ message: 'Already upvoted' });
    }

    roast.upvotes += 1;
    roast.upvotedBy.push(userId);

    await snippet.save();
    res.status(200).json({ success: true, data: snippet });
  } catch (error) {
    next(error);
  }
};
