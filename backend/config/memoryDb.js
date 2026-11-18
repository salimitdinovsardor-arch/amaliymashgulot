const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generate MongoDB-like 24-char ObjectId
const generateObjectId = () => crypto.randomBytes(12).toString('hex');

// In-Memory collections
const memoryStore = {
  users: [],
  refreshTokens: [],
  courses: [],
  activities: [],
};

// Document wrapper for User
class UserDocument {
  constructor(data) {
    this._id = data._id || generateObjectId();
    this.name = data.name;
    this.email = (data.email || '').toLowerCase();
    this.password = data.password;
    this.role = data.role || 'student';
    this.avatar = data.avatar || '';
    this.headline = data.headline || 'Student & Lifelong Learner';
    this.bio = data.bio || 'Learning modern web development and software engineering at EduHub.';
    this.location = data.location || 'Tashkent, Uzbekistan';
    this.phone = data.phone || '';
    this.enrolledCourses = (data.enrolledCourses || []).map((e) => ({
      _id: e._id || generateObjectId(),
      course: e.course,
      progress: e.progress || 0,
      enrolledAt: e.enrolledAt || new Date(),
      lastAccessedAt: e.lastAccessedAt || new Date(),
    }));
    this.preferences = {
      emailNotifications: data.preferences?.emailNotifications ?? true,
      weeklyDigest: data.preferences?.weeklyDigest ?? true,
      courseUpdates: data.preferences?.courseUpdates ?? true,
    };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = new Date();
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const clone = { ...this };
    delete clone.password;
    return clone;
  }

  async save() {
    this.updatedAt = new Date();
    // Hash password if not already hashed
    if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    const idx = memoryStore.users.findIndex((u) => u._id.toString() === this._id.toString());
    if (idx !== -1) {
      memoryStore.users[idx] = this;
    } else {
      memoryStore.users.push(this);
    }
    return this;
  }
}

// User Collection Wrapper
const MemoryUser = {
  findOne(query) {
    let result = memoryStore.users.find((u) => {
      if (query.email && u.email !== query.email.toLowerCase()) return false;
      if (query._id && u._id.toString() !== query._id.toString()) return false;
      return true;
    });

    const chain = {
      user: result ? new UserDocument(result) : null,
      select(fields) {
        return this;
      },
      then(resolve) {
        resolve(this.user);
      },
    };
    return chain;
  },

  findById(id) {
    const raw = memoryStore.users.find((u) => u._id.toString() === (id._id || id).toString());
    const doc = raw ? new UserDocument(raw) : null;

    const chain = {
      user: doc,
      select(fields) {
        if (fields && fields.includes('-password') && this.user) {
          delete this.user.password;
        }
        return this;
      },
      populate(options) {
        if (this.user && options.path.includes('course')) {
          this.user.enrolledCourses = this.user.enrolledCourses.map((enrollment) => {
            const courseId = enrollment.course?._id || enrollment.course;
            const fullCourse = memoryStore.courses.find(
              (c) => c._id.toString() === (courseId ? courseId.toString() : '')
            );
            return {
              ...enrollment,
              course: fullCourse || enrollment.course,
            };
          });
        }
        return this;
      },
      then(resolve) {
        resolve(this.user);
      },
    };
    return chain;
  },

  async create(data) {
    const doc = new UserDocument(data);
    await doc.save();
    return doc;
  },

  async findByIdAndUpdate(id, update, options = {}) {
    const raw = memoryStore.users.find((u) => u._id.toString() === (id._id || id).toString());
    if (!raw) return null;

    const updates = update.$set || update;
    Object.assign(raw, updates);
    raw.updatedAt = new Date();
    return new UserDocument(raw);
  },
};

class RefreshTokenDocument {
  constructor(data) {
    this._id = data._id || generateObjectId();
    this.user = data.user;
    this.token = data.token;
    this.expiresAt = data.expiresAt;
    this.revoked = data.revoked || false;
    this.replacedByToken = data.replacedByToken || null;
    this.userAgent = data.userAgent || '';
    this.ipAddress = data.ipAddress || '';
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    const idx = memoryStore.refreshTokens.findIndex((t) => t._id.toString() === this._id.toString());
    if (idx !== -1) {
      memoryStore.refreshTokens[idx] = this;
    } else {
      memoryStore.refreshTokens.push(this);
    }
    return this;
  }
}

// RefreshToken Collection Wrapper
const MemoryRefreshToken = {
  async create(data) {
    const item = new RefreshTokenDocument(data);
    await item.save();
    return item;
  },

  async findOne(query) {
    const raw = memoryStore.refreshTokens.find((t) => {
      if (query.token && t.token !== query.token) return false;
      return true;
    });
    return raw ? new RefreshTokenDocument(raw) : null;
  },

  async findOneAndUpdate(query, update) {
    const token = memoryStore.refreshTokens.find((t) => {
      if (query.token && t.token !== query.token) return false;
      return true;
    });
    if (token) {
      Object.assign(token, update.$set || update);
      return token;
    }
    return null;
  },

  async updateMany(query, update) {
    let count = 0;
    memoryStore.refreshTokens.forEach((t) => {
      if (query.user && t.user.toString() === query.user.toString()) {
        Object.assign(t, update.$set || update);
        count++;
      }
    });
    return { modifiedCount: count };
  },
};

// Course Collection Wrapper
const MemoryCourse = {
  async countDocuments() {
    return memoryStore.courses.length;
  },

  async insertMany(items) {
    const created = items.map((c) => ({
      ...c,
      _id: c._id || generateObjectId(),
      createdAt: new Date(),
    }));
    memoryStore.courses.push(...created);
    return created;
  },

  find(query = {}) {
    let results = [...memoryStore.courses];

    if (query.category) {
      results = results.filter((c) => c.category === query.category);
    }
    if (query.level) {
      results = results.filter((c) => c.level === query.level);
    }
    if (query.$or) {
      // search query
      const pattern = query.$or[0].title.$regex;
      const regex = new RegExp(pattern, 'i');
      results = results.filter(
        (c) =>
          regex.test(c.title) ||
          regex.test(c.description) ||
          (c.instructor?.name && regex.test(c.instructor.name))
      );
    }

    const chain = {
      results,
      sort(criteria) {
        return this;
      },
      then(resolve) {
        resolve(this.results);
      },
    };
    return chain;
  },

  async findById(id) {
    const course = memoryStore.courses.find((c) => c._id.toString() === (id._id || id).toString());
    if (!course) return null;

    return {
      ...course,
      async save() {
        const idx = memoryStore.courses.findIndex((c) => c._id.toString() === this._id.toString());
        if (idx !== -1) memoryStore.courses[idx] = this;
        return this;
      },
    };
  },
};

// Activity Collection Wrapper
const MemoryActivity = {
  async create(data) {
    const activity = {
      _id: generateObjectId(),
      user: data.user,
      type: data.type || 'lesson_completed',
      title: data.title,
      description: data.description || '',
      metadata: data.metadata || {},
      createdAt: new Date(),
    };
    memoryStore.activities.unshift(activity);
    return activity;
  },

  find(query = {}) {
    let items = memoryStore.activities.filter((a) => {
      if (query.user && a.user.toString() !== query.user.toString()) return false;
      return true;
    });

    const chain = {
      items,
      sort(criteria) {
        return this;
      },
      limit(n) {
        this.items = this.items.slice(0, n);
        return this;
      },
      then(resolve) {
        resolve(this.items);
      },
    };
    return chain;
  },
};

module.exports = {
  memoryStore,
  MemoryUser,
  MemoryRefreshToken,
  MemoryCourse,
  MemoryActivity,
};
