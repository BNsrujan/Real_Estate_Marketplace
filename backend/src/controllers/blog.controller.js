import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { blogPosts, blogCategories, blogTags, blogPostTags, users } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const postRow = {
    id: blogPosts.id,
    slug: blogPosts.slug,
    title: blogPosts.title,
    excerpt: blogPosts.excerpt,
    coverImage: blogPosts.coverImage,
    status: blogPosts.status,
    authorId: blogPosts.authorId,
    authorName: users.name,
    categoryId: blogPosts.categoryId,
    categoryName: blogCategories.name,
    publishedAt: blogPosts.publishedAt,
    createdAt: blogPosts.createdAt,
    updatedAt: blogPosts.updatedAt,
};

async function fetchPostTags(postId) {
    return db.select({ id: blogTags.id, name: blogTags.name, slug: blogTags.slug })
        .from(blogPostTags)
        .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
        .where(eq(blogPostTags.postId, postId));
}

const getPosts = asyncHandler(async (req, res) => {
    const { category, page = 1, limit = 20, all } = req.query;

    const conditions = [];

    // Non-admin sees only published posts
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'agent';
    if (!all || !isAdmin) conditions.push(eq(blogPosts.status, 'published'));

    if (category) conditions.push(eq(blogCategories.name, category));

    const offset = (Number(page) - 1) * Number(limit);

    const rows = await db
        .select(postRow)
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(blogPosts.publishedAt))
        .limit(Number(limit))
        .offset(offset);

    return res.status(200).json(new ApiResponse(200, {
        data: rows,
        page: Number(page),
        limit: Number(limit),
    }));
});

const getPostBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const rows = await db
        .select({ ...postRow, body: blogPosts.body })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(eq(blogPosts.slug, slug))
        .limit(1);

    if (!rows.length) throw new ApiError(404, 'Post not found');

    const tags = await fetchPostTags(rows[0].id);
    return res.status(200).json(new ApiResponse(200, { ...rows[0], tags }));
});

const getCategories = asyncHandler(async (_req, res) => {
    const rows = await db.select().from(blogCategories);
    return res.status(200).json(new ApiResponse(200, { data: rows }));
});

const getTags = asyncHandler(async (_req, res) => {
    const rows = await db.select().from(blogTags);
    return res.status(200).json(new ApiResponse(200, { data: rows }));
});

const createPost = asyncHandler(async (req, res) => {
    const { slug, title, excerpt, body, coverImage, status = 'draft', categoryId, tagIds = [] } = req.body;

    if (!slug || !title) throw new ApiError(400, 'slug and title are required');

    const existing = await db.select({ id: blogPosts.id }).from(blogPosts)
        .where(eq(blogPosts.slug, slug)).limit(1);
    if (existing.length) throw new ApiError(409, 'Slug already exists');

    const authorId = req.user.userId;

    const [post] = await db.insert(blogPosts).values({
        slug, title, excerpt, body, coverImage, status, categoryId, authorId,
        publishedAt: status === 'published' ? new Date() : null,
    }).returning();

    if (tagIds.length) {
        await db.insert(blogPostTags).values(tagIds.map((tagId) => ({ postId: post.id, tagId })));
    }

    const tags = await fetchPostTags(post.id);
    return res.status(201).json(new ApiResponse(201, { ...post, tags }));
});

const updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await db.select({ authorId: blogPosts.authorId, status: blogPosts.status })
        .from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (!existing.length) throw new ApiError(404, 'Post not found');

    const { role, userId } = req.user;
    if (role !== 'admin' && existing[0].authorId !== userId) {
        throw new ApiError(403, 'You do not own this post');
    }

    const { tagIds, ...fields } = req.body;
    const patch = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));

    if (patch.status === 'published' && existing[0].status !== 'published') {
        patch.publishedAt = new Date();
    }

    await db.transaction(async (tx) => {
        if (Object.keys(patch).length) {
            await tx.update(blogPosts).set({ ...patch, updatedAt: new Date() })
                .where(eq(blogPosts.id, id));
        }

        if (tagIds !== undefined) {
            await tx.delete(blogPostTags).where(eq(blogPostTags.postId, id));
            if (tagIds.length) {
                await tx.insert(blogPostTags).values(tagIds.map((tagId) => ({ postId: id, tagId })));
            }
        }
    });

    const [rows] = await db.select({ ...postRow, body: blogPosts.body }).from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(eq(blogPosts.id, id)).limit(1);

    const tags = await fetchPostTags(id);
    return res.status(200).json(new ApiResponse(200, { ...rows, tags }));
});

const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await db.select({ id: blogPosts.id }).from(blogPosts)
        .where(eq(blogPosts.id, id)).limit(1);
    if (!existing.length) throw new ApiError(404, 'Post not found');

    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return res.status(200).json(new ApiResponse(200, { message: 'Post deleted' }));
});

export { getPosts, getPostBySlug, getCategories, getTags, createPost, updatePost, deletePost };
