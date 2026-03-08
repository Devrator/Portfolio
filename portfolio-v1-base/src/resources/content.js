import { Logo } from "@once-ui-system/core";

const person = {
  firstName: "Deepak",
  lastName: "Sharma",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "IT Student",
  avatar: "/public/images/profile.jpg", // Place your image as /public/profile.jpg
  email: "deepakpvinodsharma@gmail.com",
  location: "Asia/Kolkata",
  languages: ["English", "Hindi"],
};

const newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: (
    <>
      I occasionally share updates about my learning journey in programming, DSA, and modern tech tools like Git, GitHub, and Databricks.
    </>
  ),
};

const social = [
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/Devrator",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/deepaksharma--",
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
];

const home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my projects, learning, and goals as a ${person.role}`,
  headline: <>Exploring the world of programming, AI, and real-world problem solving</>,
  featured: {
    display: true,
    title: <>Latest: <strong className="ml-4">Learning Spark, Databricks & MLflow</strong></>,
    href: "/work/building-ml-pipelines",
  },
  subline: (
    <>
      I'm Deepak, currently in 2nd year of B.Tech in IT at RTU Kota. Passionate about DSA, AI/ML,
      and building real-world tech solutions. Always learning, always building.
    </>
  ),
};

const about = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: false,
    link: "",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        I'm a 2nd-year Information Technology student at RTU Kota with a growing passion for software
        engineering, machine learning, and cloud computing. I’m currently focused on mastering
        Data Structures, contributing to open-source, and building my skill set with tools like
        Databricks, Spark, and MLflow.
      </>
    ),
  },
  work: {
  display: true,
  title: "Work Experience",
  experiences: [
    {
      company: "Xebia",
      timeframe: "June 2025 – July 2025",
      role: "Data Science Intern (Non-Coding Role)",
      achievements: [
        <>Completed a one-month internship focused on real-world data science workflows in a non-coding environment.</>,
        <>Gained practical exposure to tools like Databricks, MLflow, and basic data handling using Apache Spark.</>,
        <>Collaborated in a professional corporate setup, improving reporting and observational skills in data-driven projects.</>,
      ],
      images: [
        {
          src: "/images/projects/project-01/cover-04.jpg",
          alt: "Xebia Internship",
          width: 16,
          height: 9,
        },
      ],
    },
  ],
  },
  studies: {
    display: true,
    title: "Studies",
    institutions: [
      {
        name: "Rajasthan Technical University, Kota",
        description: <>B.Tech in Information Technology (2024 – 2028)</>,
      },
      {
        name: "NWAC (Sr. Secondary)",
        description: <>Completed Class 12 with Science Stream</>,
      },
    ],
  },
  technical: {
    display: true,
    title: "Technical Skills",
    skills: [
      {
        title: "Git & GitHub",
        description: <>Basic version control and open-source contributions</>,
        images: [],
      },
      {
        title: "Data Structures & Algorithms",
        description: <>Working knowledge of DSA using Python and C++</>,
        images: [],
      },
      {
        title: "Databricks & MLflow",
        description: <>Learning to build ML pipelines and track models</>,
        images: [],
      },
      {
        title: "Apache Spark",
        description: <>Hands-on with Spark transformations and actions</>,
        images: [],
      },
    ],
  },
};

const blog = {
  path: "/blog",
  label: "Blog",
  title: "Learning Journal",
  description: `Deepak shares learnings, projects, and insights from his tech journey.`,
};

const work = {
  path: "/work",
  label: "Projects",
  title: `Projects – ${person.name}`,
  description: `Projects and experiments built by ${person.name}`,
};

const gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  images: [
    {
      src: "/images/gallery/horizontal-1.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-2.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-3.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-4.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-1.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-2.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-3.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-4.jpg",
      alt: "image",
      orientation: "vertical",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };

