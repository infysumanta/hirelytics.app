export interface Skill {
  value: string;
  label: string;
  category: SkillCategory;
}

export type SkillCategory =
  | 'programming'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'mobile'
  | 'ai'
  | 'design'
  | 'testing'
  | 'other';

export const technicalSkills: Skill[] = [
  // Programming Languages
  { value: 'javascript', label: 'JavaScript', category: 'programming' },
  { value: 'typescript', label: 'TypeScript', category: 'programming' },
  { value: 'python', label: 'Python', category: 'programming' },
  { value: 'java', label: 'Java', category: 'programming' },
  { value: 'csharp', label: 'C#', category: 'programming' },
  { value: 'cpp', label: 'C++', category: 'programming' },
  { value: 'go', label: 'Go', category: 'programming' },
  { value: 'rust', label: 'Rust', category: 'programming' },
  { value: 'php', label: 'PHP', category: 'programming' },
  { value: 'ruby', label: 'Ruby', category: 'programming' },
  { value: 'swift', label: 'Swift', category: 'programming' },
  { value: 'kotlin', label: 'Kotlin', category: 'programming' },

  // Frontend
  { value: 'react', label: 'React', category: 'frontend' },
  { value: 'angular', label: 'Angular', category: 'frontend' },
  { value: 'vue', label: 'Vue.js', category: 'frontend' },
  { value: 'nextjs', label: 'Next.js', category: 'frontend' },
  { value: 'html', label: 'HTML', category: 'frontend' },
  { value: 'css', label: 'CSS', category: 'frontend' },
  { value: 'sass', label: 'Sass/SCSS', category: 'frontend' },
  { value: 'tailwind', label: 'Tailwind CSS', category: 'frontend' },
  { value: 'bootstrap', label: 'Bootstrap', category: 'frontend' },
  { value: 'redux', label: 'Redux', category: 'frontend' },
  { value: 'webpack', label: 'Webpack', category: 'frontend' },
  { value: 'vite', label: 'Vite', category: 'frontend' },

  // Backend
  { value: 'nodejs', label: 'Node.js', category: 'backend' },
  { value: 'express', label: 'Express.js', category: 'backend' },
  { value: 'nestjs', label: 'NestJS', category: 'backend' },
  { value: 'django', label: 'Django', category: 'backend' },
  { value: 'flask', label: 'Flask', category: 'backend' },
  { value: 'fastapi', label: 'FastAPI', category: 'backend' },
  { value: 'spring', label: 'Spring Boot', category: 'backend' },
  { value: 'aspnet', label: 'ASP.NET Core', category: 'backend' },
  { value: 'laravel', label: 'Laravel', category: 'backend' },
  { value: 'rails', label: 'Ruby on Rails', category: 'backend' },
  { value: 'graphql', label: 'GraphQL', category: 'backend' },
  { value: 'rest', label: 'RESTful APIs', category: 'backend' },

  // Database
  { value: 'mongodb', label: 'MongoDB', category: 'database' },
  { value: 'mysql', label: 'MySQL', category: 'database' },
  { value: 'postgresql', label: 'PostgreSQL', category: 'database' },
  { value: 'sqlserver', label: 'SQL Server', category: 'database' },
  { value: 'oracle', label: 'Oracle', category: 'database' },
  { value: 'redis', label: 'Redis', category: 'database' },
  { value: 'elasticsearch', label: 'Elasticsearch', category: 'database' },
  { value: 'firebase', label: 'Firebase', category: 'database' },
  { value: 'dynamodb', label: 'DynamoDB', category: 'database' },
  { value: 'prisma', label: 'Prisma', category: 'database' },
  { value: 'sequelize', label: 'Sequelize', category: 'database' },
  { value: 'mongoose', label: 'Mongoose', category: 'database' },

  // DevOps
  { value: 'docker', label: 'Docker', category: 'devops' },
  { value: 'kubernetes', label: 'Kubernetes', category: 'devops' },
  { value: 'aws', label: 'AWS', category: 'devops' },
  { value: 'azure', label: 'Azure', category: 'devops' },
  { value: 'gcp', label: 'Google Cloud', category: 'devops' },
  { value: 'jenkins', label: 'Jenkins', category: 'devops' },
  { value: 'github-actions', label: 'GitHub Actions', category: 'devops' },
  { value: 'gitlab-ci', label: 'GitLab CI', category: 'devops' },
  { value: 'terraform', label: 'Terraform', category: 'devops' },
  { value: 'ansible', label: 'Ansible', category: 'devops' },
  { value: 'nginx', label: 'Nginx', category: 'devops' },
  { value: 'linux', label: 'Linux', category: 'devops' },

  // Mobile
  { value: 'react-native', label: 'React Native', category: 'mobile' },
  { value: 'flutter', label: 'Flutter', category: 'mobile' },
  { value: 'ios', label: 'iOS Development', category: 'mobile' },
  { value: 'android', label: 'Android Development', category: 'mobile' },
  { value: 'xamarin', label: 'Xamarin', category: 'mobile' },
  { value: 'ionic', label: 'Ionic', category: 'mobile' },

  // AI/ML
  { value: 'tensorflow', label: 'TensorFlow', category: 'ai' },
  { value: 'pytorch', label: 'PyTorch', category: 'ai' },
  { value: 'scikit-learn', label: 'scikit-learn', category: 'ai' },
  { value: 'nlp', label: 'Natural Language Processing', category: 'ai' },
  { value: 'computer-vision', label: 'Computer Vision', category: 'ai' },
  { value: 'data-science', label: 'Data Science', category: 'ai' },
  { value: 'machine-learning', label: 'Machine Learning', category: 'ai' },
  { value: 'deep-learning', label: 'Deep Learning', category: 'ai' },

  // Design
  { value: 'figma', label: 'Figma', category: 'design' },
  { value: 'sketch', label: 'Sketch', category: 'design' },
  { value: 'adobe-xd', label: 'Adobe XD', category: 'design' },
  { value: 'ui-design', label: 'UI Design', category: 'design' },
  { value: 'ux-design', label: 'UX Design', category: 'design' },
  { value: 'responsive-design', label: 'Responsive Design', category: 'design' },

  // Testing
  { value: 'jest', label: 'Jest', category: 'testing' },
  { value: 'cypress', label: 'Cypress', category: 'testing' },
  { value: 'selenium', label: 'Selenium', category: 'testing' },
  { value: 'mocha', label: 'Mocha', category: 'testing' },
  { value: 'chai', label: 'Chai', category: 'testing' },
  { value: 'testing-library', label: 'Testing Library', category: 'testing' },
  { value: 'junit', label: 'JUnit', category: 'testing' },
  { value: 'pytest', label: 'pytest', category: 'testing' },

  // Other
  { value: 'git', label: 'Git', category: 'other' },
  { value: 'agile', label: 'Agile Methodology', category: 'other' },
  { value: 'scrum', label: 'Scrum', category: 'other' },
  { value: 'jira', label: 'Jira', category: 'other' },
  { value: 'websockets', label: 'WebSockets', category: 'other' },
  { value: 'microservices', label: 'Microservices', category: 'other' },
  { value: 'serverless', label: 'Serverless', category: 'other' },
  { value: 'pwa', label: 'Progressive Web Apps', category: 'other' },
  { value: 'blockchain', label: 'Blockchain', category: 'other' },
  { value: 'web3', label: 'Web3', category: 'other' },
];

// Group skills by category for easier selection
export const skillsByCategory = technicalSkills.reduce<Record<SkillCategory, Skill[]>>(
  (acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  },
  {
    programming: [],
    frontend: [],
    backend: [],
    database: [],
    devops: [],
    mobile: [],
    ai: [],
    design: [],
    testing: [],
    other: [],
  }
);

// Get all skill values as a simple array
export const skillValues = technicalSkills.map((skill) => skill.value);

// Get all skill labels as a simple array
export const skillLabels = technicalSkills.map((skill) => skill.label);

// Function to get label from value
export const getSkillLabel = (value: string): string => {
  const skill = technicalSkills.find((s) => s.value === value);
  return skill ? skill.label : value;
};

// Function to get skill object from value
export const getSkillByValue = (value: string): Skill | undefined => {
  return technicalSkills.find((s) => s.value === value);
};
