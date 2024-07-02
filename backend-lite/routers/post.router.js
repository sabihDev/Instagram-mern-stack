const express = require("express");
const router = express.Router();
const { User, Post, Comment, Like } = require("../models"); // Adjust according to your Sequelize models
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { Jwt_secret } = require("../keys"); // Ensure you have a secure secret key
const { Op } = require("sequelize");
const requireLogin = require("../middlewares/requireLogin");

// Route to get all posts
router.get("/allposts", requireLogin, async (req, res) => {
    try {
        // Fetch all posts with the user who posted each post
        let posts = await Post.findAll({
            include: [
                { model: User, as: 'postedBy', attributes: ['id', 'name', 'photo'] },
            ],
            order: [['createdAt', 'DESC']]
        });

        // Fetch comments for each post
        for (let post of posts) {
            let comments = await Comment.findAll({
                where: { postId: post.id },
                attributes: ['id', 'text', 'createdAt'],
            });
            post.dataValues.comments = comments; // Attach comments to each post

            // Fetch likes for each post
            let likes = await Like.findAll({
                where: { postId: post.id },
                attributes: ['id', 'userId'], // Adjust attributes as needed
            });
            post.dataValues.likes = likes; // Attach likes to each post

        }

        res.json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Error fetching posts' });
    }
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
        const posts = await Post.findAll({
            where: { userId: req.user.id },
            include: [
                { model: User, as: 'postedBy', attributes: ['id', 'name'] },
            ],
            order: [['createdAt', 'DESC']]
        });

        // Fetch comments for each post
        for (let post of posts) {
            let comments = await Comment.findAll({
                where: { postId: post.id },
                attributes: ['id', 'text', 'createdAt'],
            });
            post.dataValues.comments = comments; // Attach comments to each post

            // Fetch likes for each post
            let likes = await Like.findAll({
                where: { postId: post.id },
                attributes: ['id', 'userId'], // Adjust attributes as needed
            });
            post.dataValues.likes = likes; // Attach likes to each post

        }

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to like a post
router.put("/like", requireLogin, async (req, res) => {

    const { postId } = req.body;
    try {
        // Check if the post exists
        const post = await Post.findByPk(postId);
        console.log(post);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if the user has already liked the post
        const alreadyLiked = await Like.findOne({
            where: {
                postId: post.id,
                userId: req.user.id
            }
        });

        if (alreadyLiked) {
            return res.status(400).json({ error: "Post already liked by the user" });
        }

        console.log("At like");
        // Create a new like record
        await Like.create({
            postId: postId,
            userId: req.user.id
        });

        res.json({ message: "Post liked successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to unlike a post
router.put("/unlike", requireLogin, async (req, res) => {
    const { postId } = req.body;
    try {
        // Find the post by postId
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if the user has already liked the post
        const like = await Like.findOne({
            where: {
                postId: postId,
                userId: req.user.id
            }
        });

        if (!like) {
            return res.status(400).json({ error: "Post not liked by the user" });
        }

        // Remove the like
        await like.destroy();

        res.json({ message: "Post unliked successfully" });
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
        await Comment.destroy({ where: { postId } });
        await Like.destroy({ where: { postId } });
        await post.destroy();
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to get user profile
router.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }


        const posts = await Post.findAll({
            where: { userId: req.params.id },
        });

        for (let post of posts) {
            let comments = await Comment.findAll({
                where: { postId: post.id },
                attributes: ['id', 'text', 'createdAt'],
            });
            post.dataValues.comments = comments; // Attach comments to each post

            // Fetch likes for each post
            let likes = await Like.findAll({
                where: { postId: post.id },
                attributes: ['id', 'userId'], // Adjust attributes as needed
            });
            post.dataValues.likes = likes; // Attach likes to each post

        }

        res.status(200).json({ user, posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.put("/follow", requireLogin, async (req, res) => {
    const { followId } = req.body;

    try {
        const userToFollow = await User.findByPk(followId);
        if (!userToFollow) {
            return res.status(404).json({ error: "User not found" });
        }

        const currentUser = await User.findByPk(req.user.id);

        await currentUser.addFollowing(userToFollow);
        await userToFollow.addFollower(currentUser);

        res.json({ message: "Followed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to unfollow a user
router.put("/unfollow", requireLogin, async (req, res) => {
    const { followId } = req.body;

    try {
        const userToUnfollow = await User.findByPk(followId);
        if (!userToUnfollow) {
            return res.status(404).json({ error: "User not found" });
        }

        const currentUser = await User.findByPk(req.user.id);

        await currentUser.removeFollowing(userToUnfollow);
        await userToUnfollow.removeFollower(currentUser);

        res.json({ message: "Unfollowed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to upload profile picture
router.put("/uploadProfilePic", requireLogin, async (req, res) => {
    const { pic } = req.body;

    if (!pic) {
        return res.status(422).json({ error: "No picture provided" });
    }

    try {
        const updatedUser = await User.update(
            { photo: pic },
            { where: { id: req.user.id }, returning: true, plain: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(updatedUser[1]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to show posts from followed users
router.get("/myfollowingposts", requireLogin, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{
                model: User,
                as: 'following',
                attributes: ['id']
            }]
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const followingIds = user.following.map(followingUser => followingUser.id);

        const posts = await Post.findAll({
            where: { userId: followingIds },
            order: [['createdAt', 'DESC']]
        });

        for (let post of posts) {
            let comments = await Comment.findAll({
                where: { postId: post.id },
                attributes: ['id', 'text', 'createdAt'],
            });
            post.dataValues.comments = comments; // Attach comments to each post

            // Fetch likes for each post
            let likes = await Like.findAll({
                where: { postId: post.id },
                attributes: ['id', 'userId'], // Adjust attributes as needed
            });
            post.dataValues.likes = likes; // Attach likes to each post

        }


        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
