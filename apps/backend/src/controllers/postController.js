import { Post } from '../models/Post.js';

// Get posts with pagination and filtering
export const getPosts = async (req, res, next) => {
  try {
    const { search, tag, page = 1, limit = 20 } = req.query;
    
    let query = { status: 'Active' };
    
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { content: { $regex: escaped, $options: 'i' } },
        { tags: { $regex: escaped, $options: 'i' } }
      ];
    }
    if (tag && tag.trim()) {
      query.tags = { $in: [new RegExp(`^${tag.trim().replace(/^#/, '')}$`, 'i')] };
    }

    const posts = await Post.find(query)
      .populate('author', 'name role avatar')
      .populate('comments.author', 'name role avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      totalPages: Math.ceil(total / limit),
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    let { title, content, tags } = req.body;

    if (typeof tags === 'string') {
      tags = tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
    } else if (Array.isArray(tags)) {
      tags = tags.map(t => String(t).trim().replace(/^#/, '')).filter(Boolean);
    } else {
      tags = [];
    }

    const post = await Post.create({
      author: req.user.id,
      title: title?.trim(),
      content: content?.trim(),
      tags
    });
    
    // Populate author so frontend can display name/avatar immediately
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name role avatar')
      .populate('comments.author', 'name role avatar')
      .lean();

    const io = req.app.get('io');
    if (io) {
      io.emit('new_post', populatedPost);
    }

    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    next(error);
  }
};

export const toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const isLiked = post.likes.includes(req.user.id);
    if (isLiked) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    
    const io = req.app.get('io');
    if (io) {
      io.emit('post_liked', { postId: post._id, likesCount: post.likes.length });
    }

    res.status(200).json({ success: true, likesCount: post.likes.length, isLiked: !isLiked });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({
      author: req.user.id,
      content: content.trim()
    });

    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name role avatar')
      .populate('comments.author', 'name role avatar')
      .lean();

    const newComment = updatedPost.comments[updatedPost.comments.length - 1];
    const io = req.app.get('io');
    if (io) {
      io.emit('new_comment', { postId: post._id, comment: newComment });
    }

    res.status(201).json({ success: true, data: newComment, post: updatedPost });
  } catch (error) {
    next(error);
  }
};
