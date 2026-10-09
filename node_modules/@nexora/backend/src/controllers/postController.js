import { Post } from '../models/Post.js';

// Get posts with pagination and filtering
export const getPosts = async (req, res, next) => {
  try {
    const { search, tag, page = 1, limit = 20 } = req.query;
    
    let query = { status: 'Active' };
    
    if (search) query.$text = { $search: search };
    if (tag) query.tags = tag;

    const posts = await Post.find(query)
      .populate('author', 'name role avatar')
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
    const { title, content, tags } = req.body;

    const post = await Post.create({
      author: req.user.id,
      title,
      content,
      tags
    });
    
    // Populate author so frontend can display name/avatar immediately
    const populatedPost = await Post.findById(post._id).populate('author', 'name role avatar').lean();

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
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({
      author: req.user.id,
      content
    });

    await post.save();
    
    const newComment = post.comments[post.comments.length - 1];
    const io = req.app.get('io');
    if (io) {
      io.emit('new_comment', { postId: post._id, comment: newComment });
    }

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    next(error);
  }
};
