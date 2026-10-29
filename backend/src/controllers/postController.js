import { Post } from '../models/Post.js';

/**
 * GET /api/posts
 * Retrieve all active forum discussions with filtering, search, and sorting
 * Shared across Student, Alumni, and Admin roles
 */
export const getPosts = async (req, res, next) => {
  try {
    const { search, tag, topic, sort = 'trending', page = 1, limit = 50 } = req.query;
    
    // Include both explicitly 'Active' posts and legacy posts without status
    let query = { status: { $ne: 'Hidden' } };
    
    // Search filter across title, content, tags, and topic
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { content: { $regex: escaped, $options: 'i' } },
        { tags: { $regex: escaped, $options: 'i' } },
        { topic: { $regex: escaped, $options: 'i' } }
      ];
    }

    // Tag / Topic filter
    const activeFilter = (tag || topic || '').trim();
    if (activeFilter && activeFilter.toLowerCase() !== 'all') {
      const cleanTag = activeFilter.replace(/^#/, '');
      const tagRegex = new RegExp(`^${cleanTag}$`, 'i');
      query.$or = [
        ...(query.$or || []),
        { tags: { $in: [tagRegex] } },
        { topic: tagRegex }
      ];
    }

    let sortOption = { isPinned: -1, createdAt: -1 };
    if (sort === 'newest') {
      sortOption = { isPinned: -1, createdAt: -1 };
    }

    const posts = await Post.find(query)
      .populate('author', 'name role avatar')
      .populate('comments.author', 'name role avatar')
      .sort(sortOption)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const currentUserId = req.user?.id || req.user?._id;

    // Enhance post objects with vote metadata and sort if requested
    let formattedPosts = posts.map(post => {
      const likesArr = Array.isArray(post.likes) ? post.likes : [];
      const commentsArr = Array.isArray(post.comments) ? post.comments : [];
      const isLikedByMe = currentUserId
        ? likesArr.some(id => String(id) === String(currentUserId))
        : false;

      return {
        ...post,
        likesCount: likesArr.length,
        commentsCount: commentsArr.length,
        isLikedByMe,
        // Activity score for trending calculation
        activityScore: likesArr.length * 2 + commentsArr.length
      };
    });

    if (sort === 'trending') {
      formattedPosts.sort((a, b) => {
        if (b.isPinned !== a.isPinned) return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
        return b.activityScore - a.activityScore;
      });
    } else if (sort === 'top') {
      formattedPosts.sort((a, b) => {
        if (b.isPinned !== a.isPinned) return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
        return b.likesCount - a.likesCount;
      });
    }

    const total = await Post.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: formattedPosts.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      data: formattedPosts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/posts/:id
 * Retrieve a single discussion by ID
 */
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name role avatar')
      .populate('comments.author', 'name role avatar')
      .lean();

    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found.' });
    }

    const currentUserId = req.user?.id || req.user?._id;
    const likesArr = Array.isArray(post.likes) ? post.likes : [];
    const isLikedByMe = currentUserId
      ? likesArr.some(id => String(id) === String(currentUserId))
      : false;

    return res.status(200).json({
      success: true,
      data: {
        ...post,
        likesCount: likesArr.length,
        commentsCount: (post.comments || []).length,
        isLikedByMe
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/posts
 * Publish a new discussion post to MongoDB
 * Accessible to authorized Students and Alumni
 */
export const createPost = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required to publish discussions.' });
    }

    const { title, content, tags, topic } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'A discussion title is required.' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Discussion content is required.' });
    }

    // Process tags into an array of clean strings
    let cleanTags = [];
    if (typeof tags === 'string') {
      cleanTags = tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
    } else if (Array.isArray(tags)) {
      cleanTags = tags.map(t => String(t).trim().replace(/^#/, '')).filter(Boolean);
    }

    const primaryTopic = (topic && typeof topic === 'string' && topic.trim())
      ? topic.trim().replace(/^#/, '')
      : (cleanTags[0] || 'General');

    if (cleanTags.length === 0) {
      cleanTags = [primaryTopic];
    } else if (!cleanTags.includes(primaryTopic)) {
      cleanTags.unshift(primaryTopic);
    }

    const post = await Post.create({
      author: req.user.id,
      title: title.trim(),
      content: content.trim(),
      tags: cleanTags,
      topic: primaryTopic,
      likes: [],
      comments: [],
      status: 'Active'
    });
    
    // Populate author details immediately
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name role avatar')
      .populate('comments.author', 'name role avatar')
      .lean();

    const io = req.app.get('io');
    if (io) {
      io.emit('new_post', populatedPost);
    }

    return res.status(201).json({
      success: true,
      message: 'Discussion published successfully.',
      data: {
        ...populatedPost,
        likesCount: 0,
        commentsCount: 0,
        isLikedByMe: false
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/posts/:id/like
 * Toggle vote/upvote on a discussion post (prevents duplicate votes)
 */
export const toggleLikePost = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required to vote.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found.' });
    }

    const userIdStr = String(req.user.id);
    if (!Array.isArray(post.likes)) {
      post.likes = [];
    }

    const alreadyLiked = post.likes.some(id => String(id) === userIdStr);

    if (alreadyLiked) {
      // Remove vote
      post.likes = post.likes.filter(id => String(id) !== userIdStr);
    } else {
      // Add vote (guaranteed no duplicate)
      post.likes.push(req.user.id);
    }

    await post.save();
    
    const io = req.app.get('io');
    if (io) {
      io.emit('post_liked', { postId: post._id, likesCount: post.likes.length });
    }

    return res.status(200).json({
      success: true,
      likesCount: post.likes.length,
      isLiked: !alreadyLiked,
      message: !alreadyLiked ? 'Upvoted discussion' : 'Vote removed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/posts/:id/comments
 * Add a constructive reply to an existing discussion
 */
export const addComment = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required to reply.' });
    }

    const { content } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty.' });
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found.' });
    }

    const newCommentObj = {
      author: req.user.id,
      content: content.trim(),
      createdAt: new Date(),
      likes: []
    };

    post.comments.push(newCommentObj);
    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name role avatar')
      .populate('comments.author', 'name role avatar')
      .lean();

    const createdComment = updatedPost.comments[updatedPost.comments.length - 1];

    const io = req.app.get('io');
    if (io) {
      io.emit('new_comment', { postId: post._id, comment: createdComment });
    }

    return res.status(201).json({
      success: true,
      message: 'Reply posted successfully.',
      data: createdComment,
      post: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/posts/:id
 * Edit an existing discussion post (author or Admin only)
 */
export const updatePost = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found.' });
    }

    const isAuthor = String(post.author) === String(req.user.id);
    const isAdmin = req.user.role === 'Admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to edit this discussion.' });
    }

    const { title, content, tags, topic } = req.body;
    if (title && typeof title === 'string' && title.trim()) post.title = title.trim();
    if (content && typeof content === 'string' && content.trim()) post.content = content.trim();
    if (tags) {
      post.tags = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean);
    }
    if (topic && typeof topic === 'string') post.topic = topic.trim();

    await post.save();

    const populated = await Post.findById(post._id)
      .populate('author', 'name role avatar')
      .populate('comments.author', 'name role avatar')
      .lean();

    return res.status(200).json({ success: true, message: 'Discussion updated.', data: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/posts/:id
 * Delete a discussion post (author or Admin only)
 */
export const deletePost = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found.' });
    }

    const isAuthor = String(post.author) === String(req.user.id);
    const isAdmin = req.user.role === 'Admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to delete this discussion.' });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: 'Discussion post deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/posts/stats
 * Aggregate real forum statistics directly from MongoDB
 */
export const getForumStats = async (req, res, next) => {
  try {
    const totalDiscussions = await Post.countDocuments();
    const activeDiscussions = await Post.countDocuments({ status: { $ne: 'Hidden' } });

    const [agg] = await Post.aggregate([
      { $match: { status: { $ne: 'Hidden' } } },
      {
        $project: {
          replyCount: { $size: { $ifNull: ['$comments', []] } },
          voteCount: { $size: { $ifNull: ['$likes', []] } }
        }
      },
      {
        $group: {
          _id: null,
          totalReplies: { $sum: '$replyCount' },
          totalVotes: { $sum: '$voteCount' }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalDiscussions,
        activeDiscussions,
        totalReplies: agg ? agg.totalReplies : 0,
        totalVotes: agg ? agg.totalVotes : 0
      }
    });
  } catch (error) {
    next(error);
  }
};
