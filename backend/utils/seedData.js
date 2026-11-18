const Course = require('../models/Course');
const Activity = require('../models/Activity');

const defaultCourses = [
  {
    title: 'Full-Stack Modern MERN Mastery',
    slug: 'full-stack-modern-mern-mastery',
    description: 'Master MongoDB, Express.js, React 19, Node.js and modern authentication architectures with real-world enterprise applications.',
    instructor: {
      name: 'Dr. Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: 'Principal Software Architect',
    },
    category: 'Web Development',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    duration: '28h 45m',
    totalLessons: 42,
    rating: 4.9,
    enrolledCount: 3420,
    price: 89,
    syllabus: [
      {
        module: 'Module 1: Modern Node.js Architecture',
        lessons: ['Express 5 internals', 'Middleware chains', 'HttpOnly cookie security', 'Token rotation'],
      },
      {
        module: 'Module 2: Advanced React with Tailwind CSS',
        lessons: ['State machines with Context', 'Axios interceptors', 'Custom auth hooks', 'Responsive UI systems'],
      },
      {
        module: 'Module 3: Database Optimization with MongoDB',
        lessons: ['Indexes & Aggregations', 'Schema designs', 'Transactions', 'Atlas deployment'],
      },
    ],
  },
  {
    title: 'Advanced React 19 & Tailwind Design Systems',
    slug: 'advanced-react-19-tailwind-design-systems',
    description: 'Build enterprise-grade SaaS design systems, fluid micro-interactions, dark mode themes and accessible component libraries.',
    instructor: {
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'Staff Design Engineer',
    },
    category: 'Web Development',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800',
    duration: '19h 20m',
    totalLessons: 30,
    rating: 4.8,
    enrolledCount: 2150,
    price: 79,
    syllabus: [
      {
        module: 'Module 1: Component Architecture',
        lessons: ['Compound components', 'Polymorphic design', 'Radix primitives', 'Tokens in Tailwind'],
      },
      {
        module: 'Module 2: Performance & Profiling',
        lessons: ['Concurrent rendering', 'React compiler', 'Bundle optimization'],
      },
    ],
  },
  {
    title: 'Cloud DevOps, Docker & Kubernetes CI/CD',
    slug: 'cloud-devops-docker-kubernetes-cicd',
    description: 'Learn modern DevOps pipelines, Docker containerization, Kubernetes cluster orchestration, and automated GitHub Actions deployments.',
    instructor: {
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      role: 'Senior Cloud Consultant',
    },
    category: 'DevOps',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
    duration: '22h 10m',
    totalLessons: 35,
    rating: 4.9,
    enrolledCount: 1890,
    price: 95,
    syllabus: [
      {
        module: 'Module 1: Docker Essentials',
        lessons: ['Multi-stage builds', 'Docker Compose', 'Network virtualization'],
      },
      {
        module: 'Module 2: Production Kubernetes',
        lessons: ['Ingress controllers', 'ConfigMaps & Secrets', 'Horizontal autoscaling'],
      },
    ],
  },
  {
    title: 'Data Science & Machine Learning with Python',
    slug: 'data-science-machine-learning-python',
    description: 'From NumPy and Pandas to deep learning models with PyTorch. Real-world predictive analytics and AI system workflows.',
    instructor: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'Lead ML Researcher',
    },
    category: 'Data Science',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    duration: '31h 15m',
    totalLessons: 48,
    rating: 4.7,
    enrolledCount: 4200,
    price: 85,
    syllabus: [
      {
        module: 'Module 1: Exploratory Data Analysis',
        lessons: ['Pandas deep dive', 'Seaborn visualizations', 'Handling missing data'],
      },
      {
        module: 'Module 2: Supervised Learning',
        lessons: ['Linear & Logistic Regression', 'Random Forests', 'XGBoost'],
      },
    ],
  },
  {
    title: 'Modern UI/UX Design Fundamentals with Figma',
    slug: 'modern-ui-ux-design-fundamentals-figma',
    description: 'Master user research, wireframing, interactive prototyping, and design system creation in Figma from scratch.',
    instructor: {
      name: 'Chloe Bennett',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      role: 'Senior Product Designer',
    },
    category: 'Design',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
    duration: '16h 40m',
    totalLessons: 26,
    rating: 4.8,
    enrolledCount: 1600,
    price: 69,
    syllabus: [
      {
        module: 'Module 1: User Experience Foundations',
        lessons: ['Persona creation', 'Journey mapping', 'Information architecture'],
      },
      {
        module: 'Module 2: Figma Mastery',
        lessons: ['Auto-layout 5.0', 'Component variants', 'Interactive variables'],
      },
    ],
  },
  {
    title: 'Practical Ethical Hacking & Cybersecurity',
    slug: 'practical-ethical-hacking-cybersecurity',
    description: 'Comprehensive cybersecurity training covering network vulnerabilities, OWASP Top 10, penetration testing and security posture defense.',
    instructor: {
      name: 'David Vance',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      role: 'Cybersecurity Analyst',
    },
    category: 'Cybersecurity',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
    duration: '24h 00m',
    totalLessons: 38,
    rating: 4.9,
    enrolledCount: 2980,
    price: 99,
    syllabus: [
      {
        module: 'Module 1: Web Application Attacks',
        lessons: ['SQL & NoSQL injections', 'Cross-site scripting (XSS)', 'Broken authentication'],
      },
      {
        module: 'Module 2: Defensive Engineering',
        lessons: ['Helmet & CSP policies', 'Rate limiting architectures', 'Zero-trust networks'],
      },
    ],
  },
];

const seedCoursesIfEmpty = async () => {
  try {
    const count = await Course.countDocuments();
    if (count === 0) {
      console.log('[Seed] Seeding initial courses...');
      await Course.insertMany(defaultCourses);
      console.log('[Seed] Default courses seeded successfully.');
    }
  } catch (err) {
    console.error('[Seed] Error seeding courses:', err.message);
  }
};

module.exports = {
  seedCoursesIfEmpty,
  defaultCourses,
};

