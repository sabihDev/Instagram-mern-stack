const express = require("express");
const router = express.Router();
const { User, Post, Comment } = require("../models"); // Adjust according to your Sequelize models
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { Jwt_secret } = require("../keys"); // Ensure you have a secure secret key
const { Op } = require("sequelize");
const requireLogin = require("../middlewares/requireLogin");

// Route to get all posts
router.get("/allposts", requireLogin, (req, res) => {
    Post.findAll({
        include: [
            { model: User, as: 'postedBy', attributes: ['id', 'name', 'photo'] },
        ],
        order: [['createdAt', 'DESC']]
    })
    .then(posts => res.json(posts))
    .catch(err => console.error('Error fetching posts:', err));
});

// Route to create a new post
router.post("/createPost", requireLogin, async (req, res) => {
    const { body, pic } = req.body;
    if (!body || !pic) {
        return res.status(422).json({ error: "Please add all the fields" });
    }
    try {
        const newPost = await Post.create({
            body,
            photo: pic,
            userId: req.user.id // Assuming req.user contains logged-in user details
        });
        res.json({ post: newPost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to get logged-in user's posts
router.get("/myposts", requireLogin, async (req, res) => {
    try {
        const myPosts = await Post.findAll({
            where: { userId: req.user.id },
            include: [
                { model: User, as: 'postedBy', attributes: ['id', 'name'] },
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(myPosts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to like a post
router.put("/like", requireLogin, async (req, res) => {
    const { postId } = req.body;
    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        await post.addLike(req.user.id);
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to unlike a post
router.put("/unlike", requireLogin, async (req, res) => {
    const { postId } = req.body;
    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        await post.removeLike(req.user.id);
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to add a comment to a post
router.put("/comment", requireLogin, async (req, res) => {
    const { postId, text } = req.body;
    if (!postId || !text) {
        return res.status(422).json({ error: "Please provide postId and text" });
    }
    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const newComment = await Comment.create({
            postId,
            text,
            userId: req.user.id
        });
        res.json(newComment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to delete a post
router.delete("/deletePost/:postId", requireLogin, async (req, res) => {
    const { postId } = req.params;
    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.userId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized to delete this post" });
        }
        await post.destroy();
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to get posts from users that the logged-in user is following
router.get("/myfollowingpost", requireLogin, async (req, res) => {
    try {
        const following = await User.findOne({
            where: { id: req.user.id },
            attributes: [],
            include: [{ model: User, as: 'following' }]
        });
        const followingIds = following.following.map(user => user.id);
        const posts = await Post.findAll({
            where: { userId: { [Op.in]: followingIds } },
            include: [
                { model: User, as: 'postedBy', attributes: ['id', 'name'] },
                { model: Comment, include: [{ model: User, as: 'commentedBy', attributes: ['id', 'name'] }] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
