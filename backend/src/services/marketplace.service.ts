import mongoose from 'mongoose';
import { MarketplacePost, IMarketplacePost } from '../models/MarketplacePost.js';
import { MarketplaceApplication, IMarketplaceApplication } from '../models/MarketplaceApplication.js';
import { User, IUser } from '../models/User.js';
import { ContactGrant } from '../models/ContactGrant.js';
import { Notification } from '../models/Notification.js';
import {
  MarketplaceAuthorRole,
  MarketplaceModerationStatus,
  MarketplacePostStatus,
  MarketplaceApplicationStatus,
  ContactGrantSource,
  NotificationType,
  UserRole,
} from '../enums/index.js';
import {
  CreateMarketplacePostInput,
  MarketplaceFilterInput,
} from '../schemas/marketplace.schema.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js';


export class MarketplaceService {
  /**
   * Create a new tuition requirement post
   */
  static async createPost(
    authorId: string,
    input: CreateMarketplacePostInput
  ): Promise<IMarketplacePost> {
    const user = await User.findById(authorId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const post = await MarketplacePost.create({
      authorId: new mongoose.Types.ObjectId(authorId),
      authorRole: MarketplaceAuthorRole.GUARDIAN,
      title: input.title,
      description: input.description,
      studentsInfo: [
        {
          classGrade: input.classGrade,
          curriculum: input.curriculum,
          subjects: input.subjects,
        },
      ],
      location: {
        area: input.area,
        city: input.city || 'Dhaka',
        mode: input.mode || 'IN_PERSON',
      },
      daysPerWeek: input.daysPerWeek,
      targetDaysPerMonth: input.targetDaysPerMonth,
      budgetAmount: input.budgetAmount,
      genderPreference: input.genderPreference || 'ANY',
      moderationStatus: MarketplaceModerationStatus.APPROVED, // Default approved for responsive UX
      status: MarketplacePostStatus.OPEN,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return post;
  }

  /**
   * Get public marketplace tuition posts with filters & pagination
   */
  static async getPublicPosts(filters: MarketplaceFilterInput): Promise<{
    posts: Array<Record<string, unknown>>;
    total: number;
  }> {
    const query: Record<string, unknown> = {
      status: MarketplacePostStatus.OPEN,
      moderationStatus: MarketplaceModerationStatus.APPROVED,
      deletedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'studentsInfo.subjects': searchRegex },
        { 'studentsInfo.classGrade': searchRegex },
        { 'location.area': searchRegex },
      ];
    }

    if (filters.area) {
      query['location.area'] = new RegExp(`^${filters.area}$`, 'i');
    }

    if (filters.subject) {
      query['studentsInfo.subjects'] = new RegExp(filters.subject, 'i');
    }

    if (filters.mode) {
      query['location.mode'] = filters.mode;
    }

    if (filters.minBudget || filters.maxBudget) {
      query.budgetAmount = {};
      if (filters.minBudget) {
        (query.budgetAmount as Record<string, number>).$gte = filters.minBudget;
      }
      if (filters.maxBudget) {
        (query.budgetAmount as Record<string, number>).$lte = filters.maxBudget;
      }
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const [rawPosts, total] = await Promise.all([
      MarketplacePost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'name createdAt')
        .lean(),
      MarketplacePost.countDocuments(query),
    ]);

    // Attach application counts for each post
    const postIds = rawPosts.map((p) => p._id);
    const appCounts = await MarketplaceApplication.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(appCounts.map((c) => [c._id.toString(), c.count]));

    const posts = rawPosts.map((p) => {
      const author = p.authorId as unknown as IUser;
      return {
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        studentsInfo: p.studentsInfo,
        location: p.location,
        daysPerWeek: p.daysPerWeek,
        targetDaysPerMonth: p.targetDaysPerMonth,
        budgetAmount: p.budgetAmount,
        genderPreference: p.genderPreference,
        status: p.status,
        expiresAt: p.expiresAt,
        createdAt: p.createdAt,
        applicationCount: countMap.get(p._id.toString()) || 0,
        author: {
          name: author ? author.name : 'Guardian',
        },
      };
    });

    return { posts, total };
  }

  /**
   * Get single marketplace post by ID
   */
  static async getPostById(postId: string): Promise<Record<string, unknown>> {
    const post = await MarketplacePost.findById(postId)
      .populate('authorId', 'name createdAt')
      .lean();

    if (!post || post.deletedAt) {
      throw new NotFoundError('Tuition post not found');
    }

    const appCount = await MarketplaceApplication.countDocuments({
      postId: post._id,
    });

    const author = post.authorId as unknown as IUser;
    return {
      id: post._id.toString(),
      title: post.title,
      description: post.description,
      studentsInfo: post.studentsInfo,
      location: post.location,
      daysPerWeek: post.daysPerWeek,
      targetDaysPerMonth: post.targetDaysPerMonth,
      budgetAmount: post.budgetAmount,
      genderPreference: post.genderPreference,
      status: post.status,
      expiresAt: post.expiresAt,
      createdAt: post.createdAt,
      applicationCount: appCount,
      author: {
        id: author?._id?.toString(),
        name: author?.name || 'Guardian',
      },
    };
  }

  /**
   * Get guardian's own posts with applicant counts
   */
  static async getMyPosts(guardianId: string): Promise<Array<Record<string, unknown>>> {
    const posts = await MarketplacePost.find({
      authorId: new mongoose.Types.ObjectId(guardianId),
      deletedAt: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .lean();

    const postIds = posts.map((p) => p._id);
    const appCounts = await MarketplaceApplication.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(appCounts.map((c) => [c._id.toString(), c.count]));

    return posts.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      studentsInfo: p.studentsInfo,
      location: p.location,
      daysPerWeek: p.daysPerWeek,
      budgetAmount: p.budgetAmount,
      status: p.status,
      createdAt: p.createdAt,
      applicationCount: countMap.get(p._id.toString()) || 0,
      hiredTeacherId: p.hiredTeacherId?.toString(),
    }));
  }

  /**
   * Close a tuition post
   */
  static async closePost(guardianId: string, postId: string): Promise<void> {
    const post = await MarketplacePost.findById(postId);
    if (!post || post.deletedAt) {
      throw new NotFoundError('Tuition post not found');
    }

    if (post.authorId.toString() !== guardianId) {
      throw new ForbiddenError('You can only close your own tuition posts');
    }

    post.status = MarketplacePostStatus.CLOSED;
    await post.save();
  }

  /**
   * Teacher applies to a tuition post
   */
  static async applyToPost(
    teacherId: string,
    postId: string,
    message: string
  ): Promise<IMarketplaceApplication> {
    const post = await MarketplacePost.findById(postId);
    if (!post || post.deletedAt) {
      throw new NotFoundError('Tuition post not found');
    }

    if (post.status !== MarketplacePostStatus.OPEN) {
      throw new BadRequestError('This tuition post is no longer accepting applications');
    }

    if (post.expiresAt < new Date()) {
      throw new BadRequestError('This tuition post has expired');
    }

    // Check if teacher has already applied
    const existing = await MarketplaceApplication.findOne({
      postId: post._id,
      teacherId: new mongoose.Types.ObjectId(teacherId),
    });

    if (existing) {
      throw new BadRequestError('You have already applied to this tuition post');
    }

    const application = await MarketplaceApplication.create({
      postId: post._id,
      teacherId: new mongoose.Types.ObjectId(teacherId),
      message,
      status: MarketplaceApplicationStatus.PENDING,
    });

    // Notify guardian
    await Notification.create({
      userId: post.authorId,
      type: NotificationType.APPLICATION_RECEIVED,
      title: 'New Tutor Application Received',
      body: `A tutor has applied to your post: "${post.title}"`,
      data: { postId: post._id.toString(), applicationId: application._id.toString() },
    });

    return application;
  }

  /**
   * Teacher views their submitted applications
   */
  static async getMyApplications(teacherId: string): Promise<Array<Record<string, unknown>>> {
    const applications = await MarketplaceApplication.find({
      teacherId: new mongoose.Types.ObjectId(teacherId),
    })
      .populate('postId')
      .sort({ appliedAt: -1 })
      .lean();

    return applications.map((app) => {
      const post = app.postId as unknown as IMarketplacePost;
      return {
        id: app._id.toString(),
        postId: post?._id?.toString(),
        postTitle: post?.title,
        postBudget: post?.budgetAmount,
        postLocation: post?.location,
        postStatus: post?.status,
        message: app.message,
        status: app.status,
        appliedAt: app.appliedAt,
      };
    });
  }

  /**
   * Guardian views all applications for a specific post
   */
  static async getPostApplications(
    guardianId: string,
    postId: string
  ): Promise<Array<Record<string, unknown>>> {
    const post = await MarketplacePost.findById(postId);
    if (!post || post.deletedAt) {
      throw new NotFoundError('Tuition post not found');
    }

    if (post.authorId.toString() !== guardianId) {
      throw new ForbiddenError('You can only view applications for your own posts');
    }

    const applications = await MarketplaceApplication.find({
      postId: post._id,
    })
      .populate('teacherId', 'name avatarUrl phone email teacherProfile')
      .sort({ appliedAt: -1 })
      .lean();

    return applications.map((app) => {
      const teacher = app.teacherId as unknown as IUser;
      return {
        id: app._id.toString(),
        status: app.status,
        message: app.message,
        appliedAt: app.appliedAt,
        teacher: {
          id: teacher?._id?.toString(),
          name: teacher?.name,
          avatarUrl: teacher?.avatarUrl,
          phone: app.status === MarketplaceApplicationStatus.ACCEPTED ? teacher?.phone : undefined,
          email: app.status === MarketplaceApplicationStatus.ACCEPTED ? teacher?.email : undefined,
          institution: teacher?.teacherProfile?.institution,
          department: teacher?.teacherProfile?.department,
          experienceYears: teacher?.teacherProfile?.experienceYears,
          bio: teacher?.teacherProfile?.bio,
          subjectsOffered: teacher?.teacherProfile?.subjectsOffered,
          verificationStatus: teacher?.teacherProfile?.verificationStatus,
        },
      };
    });
  }

  /**
   * Guardian accepts or rejects an application
   */
  static async respondToApplication(
    guardianId: string,
    applicationId: string,
    action: 'ACCEPT' | 'REJECT'
  ): Promise<Record<string, unknown>> {
    const application = await MarketplaceApplication.findById(applicationId).populate('postId');
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const post = application.postId as unknown as IMarketplacePost;
    if (!post || post.authorId.toString() !== guardianId) {
      throw new ForbiddenError('You can only respond to applications for your own posts');
    }

    if (action === 'REJECT') {
      application.status = MarketplaceApplicationStatus.REJECTED;
      await application.save();

      return {
        applicationId: application._id.toString(),
        status: application.status,
      };
    }

    // Action is ACCEPT:
    application.status = MarketplaceApplicationStatus.ACCEPTED;
    await application.save();

    // Mark post as HIRED
    await MarketplacePost.findByIdAndUpdate(post._id, {
      status: MarketplacePostStatus.HIRED,
      hiredTeacherId: application.teacherId,
    });

    // Auto-reject other pending applications for this post
    await MarketplaceApplication.updateMany(
      {
        postId: post._id,
        _id: { $ne: application._id },
        status: MarketplaceApplicationStatus.PENDING,
      },
      { status: MarketplaceApplicationStatus.REJECTED }
    );

    // Create mutual ContactGrant so teacher and guardian can communicate
    await ContactGrant.create({
      teacherId: application.teacherId,
      guardianId: post.authorId,
      source: ContactGrantSource.MARKETPLACE_ACCEPT,
      postId: post._id,
    });


    // Notify teacher
    await Notification.create({
      userId: application.teacherId,
      type: NotificationType.APPLICATION_ACCEPTED,
      title: 'Tuition Application Accepted! 🎉',
      body: `Your application for "${post.title}" was accepted! Direct contact details are now unlocked.`,
      data: { postId: post._id.toString(), applicationId: application._id.toString() },
    });

    return {
      applicationId: application._id.toString(),
      status: application.status,
      postId: post._id.toString(),
      postStatus: MarketplacePostStatus.HIRED,
    };
  }
}
