const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 3000;

// Stripe is initialized lazily so the server starts even without the key
let _stripe = null;
const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in .env");
    }
    _stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
};

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  // Allowlist origins including local dev, firebase and Vercel frontend
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://scholarshippath.firebaseapp.com",
    "https://scholar-path.vercel.app",
    process.env.DOMAIN_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // allow non-browser requests like curl
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }),
  );

// ─────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────
const scholarships = [
  // ── Engineering (3) ──────────────────────────────────────────
  {
    _id: "1",
    scholarshipName: "Swiss Government Excellence Scholarship",
    universityName: "Harvard University",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_nzRD6CX6oQhF0NXVdgDQ8XNp-gvP2vUHzkfHtaqFSg&s=10",
    universityCountry: "Switzerland",
    universityCity: "Bern",
    universityLocation: "Bern, Switzerland",
    scholarshipCategory: "Full fund",
    subjectCategory: "Engineering",
    degree: "Bachelors",
    applicationFees: 0,
    serviceCharge: 10,
    ratings: 5,
    totalReview: 3,
    applicantNumber: 3,
    applicationDeadline: "2026-01-15",
    scholarshipPostDate: "2025-06-01",
    isExpired: true,
    description:
      "The Swiss Government Excellence Scholarships promote international exchange and research cooperation between Switzerland and over 180 countries.",
  },
  {
    _id: "6",
    scholarshipName: "ETH Zurich Excellence Masters Scholarship",
    universityName: "ETH Zurich",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx3z-s2FNV_9wTJzre8oWmErbtJd-PqABAcBbA1NKjTQ&s=10",
    universityCountry: "Switzerland",
    universityCity: "Zurich",
    universityLocation: "Zurich, Switzerland",
    scholarshipCategory: "Full fund",
    subjectCategory: "Engineering",
    degree: "Masters",
    applicationFees: 0,
    serviceCharge: 75,
    ratings: 5,
    totalReview: 430,
    applicantNumber: 430,
    applicationDeadline: "2026-12-15",
    scholarshipPostDate: "2025-10-01",
    isExpired: false,
    description:
      "The ETH Zurich Excellence Scholarship & Opportunity Programme is a merit-based award for outstanding Master's students in engineering and sciences.",
  },
  {
    _id: "9",
    scholarshipName: "TU Delft Holland Scholarship",
    universityName: "Delft University of Technology",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT50JNx7Uwhb-mKb1e2ndg3vYyPuDcUjbt7u3lcGPcslw&s=10",
    universityCountry: "Netherlands",
    universityCity: "Delft",
    universityLocation: "Delft, Netherlands",
    scholarshipCategory: "Partial fund",
    subjectCategory: "Engineering",
    degree: "Bachelors",
    applicationFees: 2000,
    serviceCharge: 150,
    ratings: 4,
    totalReview: 312,
    applicantNumber: 312,
    applicationDeadline: "2027-02-01",
    scholarshipPostDate: "2025-11-01",
    isExpired: false,
    description:
      "The Holland Scholarship supports non-EEA students who want to do their bachelor's or master's programme at TU Delft.",
  },

  // ── Science (3) ───────────────────────────────────────────────
  {
    _id: "3",
    scholarshipName: "NUS ASEAN Undergraduate Merit Scholarship",
    universityName: "National University of Singapore",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX-8QLZCtnCIvW3TfCgzeJ1mRsNpCR1sda6WBKTksPzg&s=10",
    universityCountry: "Singapore",
    universityCity: "Singapore",
    universityLocation: "Singapore, Singapore",
    scholarshipCategory: "Full fund",
    subjectCategory: "Science",
    degree: "Bachelors",
    applicationFees: 22000,
    serviceCharge: 200,
    ratings: 5,
    totalReview: 1503,
    applicantNumber: 1503,
    applicationDeadline: "2026-06-15",
    scholarshipPostDate: "2025-07-01",
    isExpired: true,
    description:
      "The NUS ASEAN Undergraduate Scholarship is for outstanding ASEAN students with excellent academic results and strong co-curricular records.",
  },
  {
    _id: "10",
    scholarshipName: "Fulbright Science & Technology Award",
    universityName: "MIT",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReQ9EKnEHNGGdOI6dzIGS6j-x0G85eTmknl-Un4y2DMw&s=10",
    universityCountry: "USA",
    universityCity: "Cambridge",
    universityLocation: "Cambridge, USA",
    scholarshipCategory: "Full fund",
    subjectCategory: "Science",
    degree: "PhD",
    applicationFees: 0,
    serviceCharge: 0,
    ratings: 5,
    totalReview: 870,
    applicantNumber: 870,
    applicationDeadline: "2026-10-10",
    scholarshipPostDate: "2025-08-15",
    isExpired: false,
    description:
      "Fulbright S&T Award places students at top US universities in STEM fields, fully funded by the US Department of State.",
  },
  {
    _id: "11",
    scholarshipName: "Commonwealth Science Scholarship",
    universityName: "University of Melbourne",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe1bF_4GV-Lsrkj_YhZuPztSGwLUf3CIQsR811u_fLvQ&s=10",
    universityCountry: "Australia",
    universityCity: "Melbourne",
    universityLocation: "Melbourne, Australia",
    scholarshipCategory: "Full fund",
    subjectCategory: "Science",
    degree: "Masters",
    applicationFees: 0,
    serviceCharge: 50,
    ratings: 4,
    totalReview: 540,
    applicantNumber: 540,
    applicationDeadline: "2026-09-30",
    scholarshipPostDate: "2025-07-20",
    isExpired: false,
    description:
      "Supports Commonwealth citizens to undertake postgraduate study in science at the University of Melbourne.",
  },

  // ── Business (3) ─────────────────────────────────────────────
  {
    _id: "4",
    scholarshipName: "Stanford Knight-Hennessy Scholars Program",
    universityName: "Stanford University",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcDXhDE02BMMuKeDT36JCLHL9o657L_7KhFWyqSeQeRA&s=10",
    universityCountry: "USA",
    universityCity: "Stanford",
    universityLocation: "Stanford, USA",
    scholarshipCategory: "Full fund",
    subjectCategory: "Business",
    degree: "Masters",
    applicationFees: 0,
    serviceCharge: 50,
    ratings: 5,
    totalReview: 210,
    applicantNumber: 210,
    applicationDeadline: "2026-10-12",
    scholarshipPostDate: "2025-08-01",
    isExpired: false,
    description:
      "Knight-Hennessy Scholars is a multidisciplinary, multicultural community of graduate students from across Stanford University.",
  },
  {
    _id: "12",
    scholarshipName: "INSEAD MBA Fellowship",
    universityName: "INSEAD",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSOzFoly5EEix8vwJT4HEPYuDEMJJro1lejzLDewS0nw&s=10",
    universityCountry: "France",
    universityCity: "Fontainebleau",
    universityLocation: "Fontainebleau, France",
    scholarshipCategory: "Partial fund",
    subjectCategory: "Business",
    degree: "Masters",
    applicationFees: 3000,
    serviceCharge: 300,
    ratings: 5,
    totalReview: 680,
    applicantNumber: 680,
    applicationDeadline: "2026-11-20",
    scholarshipPostDate: "2025-09-01",
    isExpired: false,
    description:
      "INSEAD offers merit-based fellowships for outstanding MBA candidates from emerging economies.",
  },
  {
    _id: "13",
    scholarshipName: "Wharton Global Youth Business Scholarship",
    universityName: "University of Pennsylvania",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQME_GJGh-Q2boHM-dQoBBDlvaENlJ7sGG_jOx2UvykVwKwgcFa5EsZ9Mdv&s=10",
    universityCountry: "USA",
    universityCity: "Philadelphia",
    universityLocation: "Philadelphia, USA",
    scholarshipCategory: "Self fund",
    subjectCategory: "Business",
    degree: "Bachelors",
    applicationFees: 5000,
    serviceCharge: 200,
    ratings: 4,
    totalReview: 190,
    applicantNumber: 190,
    applicationDeadline: "2026-08-15",
    scholarshipPostDate: "2025-06-10",
    isExpired: false,
    description:
      "Wharton's scholarship programme for exceptional undergraduate students interested in business and entrepreneurship.",
  },

  // ── Computer Science (3) ──────────────────────────────────────
  {
    _id: "14",
    scholarshipName: "Google PhD Fellowship",
    universityName: "Carnegie Mellon University",
    universityImage: "https://www.cmu.edu/sites/default/files/cmu-visit-site-files/styles/large_hero_1920x1080/public/2025-08/visit_hero.jpg.webp?itok=Wj42GGPE",
    universityCountry: "USA",
    universityCity: "Pittsburgh",
    universityLocation: "Pittsburgh, USA",
    scholarshipCategory: "Full fund",
    subjectCategory: "Computer Science",
    degree: "PhD",
    applicationFees: 0,
    serviceCharge: 0,
    ratings: 5,
    totalReview: 1120,
    applicantNumber: 1120,
    applicationDeadline: "2026-12-01",
    scholarshipPostDate: "2025-09-15",
    isExpired: false,
    description:
      "Google PhD Fellowship supports outstanding graduate students doing exceptional work in computer science and related fields.",
  },
  {
    _id: "15",
    scholarshipName: "Microsoft Research Asia Fellowship",
    universityName: "Peking University",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWMymaRerg5-yjXDi3wLDbqdtfMJyOBTmssO5PJnPNlg&s=10",
    universityCountry: "China",
    universityCity: "Beijing",
    universityLocation: "Beijing, China",
    scholarshipCategory: "Full fund",
    subjectCategory: "Computer Science",
    degree: "Masters",
    applicationFees: 0,
    serviceCharge: 0,
    ratings: 5,
    totalReview: 760,
    applicantNumber: 760,
    applicationDeadline: "2026-09-15",
    scholarshipPostDate: "2025-07-01",
    isExpired: false,
    description:
      "MSRA Fellowship supports top Asia-Pacific PhD students in computing and related disciplines.",
  },
  {
    _id: "16",
    scholarshipName: "Canada Graduate Scholarship – CS Track",
    universityName: "University of Toronto",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX5xQSOa32EnOaiqzao3sCwCEF5OAid2Ct9ceBQEcB-A&s=10",
    universityCountry: "Canada",
    universityCity: "Toronto",
    universityLocation: "Toronto, Canada",
    scholarshipCategory: "Partial fund",
    subjectCategory: "Computer Science",
    degree: "Masters",
    applicationFees: 1000,
    serviceCharge: 100,
    ratings: 4,
    totalReview: 430,
    applicantNumber: 430,
    applicationDeadline: "2026-10-01",
    scholarshipPostDate: "2025-08-01",
    isExpired: false,
    description:
      "CGS-M supports high-calibre Canadian and international students in the sciences, engineering, and computer science.",
  },

  // ── Medicine / Doctor (3) ─────────────────────────────────────
  {
    _id: "8",
    scholarshipName: "DAAD Scholarship Germany",
    universityName: "Heidelberg University",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOxElzUc04bMLJ-2aSMnq8x1hyjYys_n1h4x3d08Psqg&s=10",
    universityCountry: "Germany",
    universityCity: "Heidelberg",
    universityLocation: "Heidelberg, Germany",
    scholarshipCategory: "Partial fund",
    subjectCategory: "Doctor",
    degree: "PhD",
    applicationFees: 1500,
    serviceCharge: 150,
    ratings: 4,
    totalReview: 650,
    applicantNumber: 650,
    applicationDeadline: "2026-08-20",
    scholarshipPostDate: "2025-06-20",
    isExpired: false,
    description:
      "The DAAD scholarship supports international students and researchers pursuing academic studies and research in Germany.",
  },
  {
    _id: "17",
    scholarshipName: "WHO Health Leaders Scholarship",
    universityName: "Johns Hopkins University",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScH-UX2OCeCmQHomp7S_Jp8qiqznhSSJnql4rhftxIvw&s=10",
    universityCountry: "USA",
    universityCity: "Baltimore",
    universityLocation: "Baltimore, USA",
    scholarshipCategory: "Full fund",
    subjectCategory: "Doctor",
    degree: "Masters",
    applicationFees: 0,
    serviceCharge: 0,
    ratings: 5,
    totalReview: 340,
    applicantNumber: 340,
    applicationDeadline: "2026-11-01",
    scholarshipPostDate: "2025-09-01",
    isExpired: false,
    description:
      "Jointly funded by WHO and JHU to train the next generation of global public health leaders.",
  },
  {
    _id: "18",
    scholarshipName: "Karolinska Medical Research Scholarship",
    universityName: "Karolinska Institute",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQZcyRLrg-FpW0lN2wgY0ZC0OJVcUpvaAmx-MZrG_kjw&s=10",
    universityCountry: "Sweden",
    universityCity: "Stockholm",
    universityLocation: "Stockholm, Sweden",
    scholarshipCategory: "Full fund",
    subjectCategory: "Doctor",
    degree: "PhD",
    applicationFees: 0,
    serviceCharge: 25,
    ratings: 5,
    totalReview: 490,
    applicantNumber: 490,
    applicationDeadline: "2027-01-15",
    scholarshipPostDate: "2025-10-15",
    isExpired: false,
    description:
      "Karolinska Institute offers fully funded PhD positions for talented international researchers in medicine and health sciences.",
  },

  // ── Agriculture (3) ──────────────────────────────────────────
  {
    _id: "19",
    scholarshipName: "FAO Agri-Youth Fellowship",
    universityName: "Wageningen University",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu6bzq4DP2LueneSeccUpCIIaKQbbB_RclL8jg3j0Ixw&s=10",
    universityCountry: "Netherlands",
    universityCity: "Wageningen",
    universityLocation: "Wageningen, Netherlands",
    scholarshipCategory: "Full fund",
    subjectCategory: "Agriculture",
    degree: "Masters",
    applicationFees: 0,
    serviceCharge: 0,
    ratings: 5,
    totalReview: 280,
    applicantNumber: 280,
    applicationDeadline: "2026-10-30",
    scholarshipPostDate: "2025-08-20",
    isExpired: false,
    description:
      "FAO and Wageningen University jointly fund young professionals from developing nations to study sustainable agriculture.",
  },
  {
    _id: "20",
    scholarshipName: "African Union Agricultural Scholarship",
    universityName: "University of Nairobi",
    universityImage: "https://uonbi.ac.ke/sites/default/files/UoN%20Towers.jpg",
    universityCountry: "Kenya",
    universityCity: "Nairobi",
    universityLocation: "Nairobi, Kenya",
    scholarshipCategory: "Full fund",
    subjectCategory: "Agriculture",
    degree: "Bachelors",
    applicationFees: 0,
    serviceCharge: 0,
    ratings: 4,
    totalReview: 155,
    applicantNumber: 155,
    applicationDeadline: "2026-07-31",
    scholarshipPostDate: "2025-05-01",
    isExpired: false,
    description:
      "Supports African students pursuing degrees in agriculture, food security, and rural development.",
  },
  {
    _id: "21",
    scholarshipName: "CGIAR Food Systems PhD Fellowship",
    universityName: "Cornell University",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgHX-Q4CY4rpEalXm565IOXNcw4AHQkVGwvAdJAKaJWg&s=10",
    universityCountry: "USA",
    universityCity: "Ithaca",
    universityLocation: "Ithaca, USA",
    scholarshipCategory: "Full fund",
    subjectCategory: "Agriculture",
    degree: "PhD",
    applicationFees: 0,
    serviceCharge: 50,
    ratings: 5,
    totalReview: 210,
    applicantNumber: 210,
    applicationDeadline: "2026-12-31",
    scholarshipPostDate: "2025-10-01",
    isExpired: false,
    description:
      "CGIAR fellowships place exceptional PhD candidates at Cornell to research sustainable global food systems.",
  },

  // ── Architecture (3) ─────────────────────────────────────────
  {
    _id: "22",
    scholarshipName: "Aga Khan Architecture Scholarship",
    universityName: "Harvard Graduate School of Design",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgYGvuzjkMu6I3hvxh-w0soB5PXhWH92rIhsD--vVQ_w&s=10",
    universityCountry: "USA",
    universityCity: "Cambridge",
    universityLocation: "Cambridge, USA",
    scholarshipCategory: "Full fund",
    subjectCategory: "Architecture",
    degree: "Masters",
    applicationFees: 0,
    serviceCharge: 0,
    ratings: 5,
    totalReview: 320,
    applicantNumber: 320,
    applicationDeadline: "2026-01-10",
    scholarshipPostDate: "2025-09-01",
    isExpired: false,
    description:
      "The Aga Khan Trust for Culture funds emerging architects from developing countries to study at Harvard GSD.",
  },
  {
    _id: "23",
    scholarshipName: "Bartlett Global Architecture Award",
    universityName: "University College London",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx0ekqvApVpKX499ElHLiC7obP5jF0IRC5biu-QwBRcw&s=10",
    universityCountry: "UK",
    universityCity: "London",
    universityLocation: "London, UK",
    scholarshipCategory: "Partial fund",
    subjectCategory: "Architecture",
    degree: "Masters",
    applicationFees: 4000,
    serviceCharge: 300,
    ratings: 4,
    totalReview: 240,
    applicantNumber: 240,
    applicationDeadline: "2026-03-31",
    scholarshipPostDate: "2025-11-15",
    isExpired: false,
    description:
      "Bartlett School of Architecture at UCL awards partial scholarships to international students showing design excellence.",
  },
  {
    _id: "24",
    scholarshipName: "TU Berlin Urban Design Scholarship",
    universityName: "Technical University of Berlin",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT54VWmg91SGfKgosijpQBQHLuTra3fj_UlVrTHy9LrIQ&s=10",
    universityCountry: "Germany",
    universityCity: "Berlin",
    universityLocation: "Berlin, Germany",
    scholarshipCategory: "Self fund",
    subjectCategory: "Architecture",
    degree: "Masters",
    applicationFees: 3500,
    serviceCharge: 200,
    ratings: 4,
    totalReview: 180,
    applicantNumber: 180,
    applicationDeadline: "2026-05-15",
    scholarshipPostDate: "2025-12-01",
    isExpired: false,
    description:
      "TU Berlin's urban design programme accepts international students with a partial support package for outstanding applicants.",
  },

  // ── Law (3) ───────────────────────────────────────────────────
  {
    _id: "25",
    scholarshipName: "Yale Law Global Scholarship",
    universityName: "Yale University",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP2Jy_3TJCMhYFS4C5xEbJoNbD5MMEya4jjeJkPfrcLg&s=10",
    universityCountry: "USA",
    universityCity: "New Haven",
    universityLocation: "New Haven, USA",
    scholarshipCategory: "Full fund",
    subjectCategory: "Law",
    degree: "Masters",
    applicationFees: 0,
    serviceCharge: 0,
    ratings: 5,
    totalReview: 560,
    applicantNumber: 560,
    applicationDeadline: "2026-11-15",
    scholarshipPostDate: "2025-08-01",
    isExpired: false,
    description:
      "Yale Law School funds exceptional international students through its LLM and JSD programmes.",
  },
  {
    _id: "26",
    scholarshipName: "Leiden University Grotius Scholarship",
    universityName: "Leiden University",
    universityImage: "https://beyondthestates.com/wp-content/uploads/2024/08/Leiden-University-Campus.jpeg",
    universityCountry: "Netherlands",
    universityCity: "Leiden",
    universityLocation: "Leiden, Netherlands",
    scholarshipCategory: "Partial fund",
    subjectCategory: "Law",
    degree: "Masters",
    applicationFees: 2500,
    serviceCharge: 200,
    ratings: 4,
    totalReview: 310,
    applicantNumber: 310,
    applicationDeadline: "2026-04-01",
    scholarshipPostDate: "2025-11-01",
    isExpired: false,
    description:
      "Named after Hugo Grotius, this award supports talented international students in Leiden's renowned law faculty.",
  },
  {
    _id: "27",
    scholarshipName: "Cambridge LLM Bursary",
    universityName: "University of Cambridge",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReq_eK2G8O586Lt1udfyUrxqLDTbPAR_VTQHwuIhXD8g&s=10",
    universityCountry: "UK",
    universityCity: "Cambridge",
    universityLocation: "Cambridge, UK",
    scholarshipCategory: "Partial fund",
    subjectCategory: "Law",
    degree: "Masters",
    applicationFees: 3000,
    serviceCharge: 250,
    ratings: 5,
    totalReview: 420,
    applicantNumber: 420,
    applicationDeadline: "2026-02-15",
    scholarshipPostDate: "2025-10-01",
    isExpired: false,
    description:
      "Cambridge Law Faculty offers need-based bursaries to international LLM students admitted to the programme.",
  },

  // ── Arts (3) ─────────────────────────────────────────────────
  {
    _id: "28",
    scholarshipName: "Royal College of Art Global Talent Award",
    universityName: "Royal College of Art",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfJgVmK6GV03mHR5OhWRTaaywtmNmBRh5znCOaNGlNGQ&s=10",
    universityCountry: "UK",
    universityCity: "London",
    universityLocation: "London, UK",
    scholarshipCategory: "Partial fund",
    subjectCategory: "Arts",
    degree: "Masters",
    applicationFees: 2000,
    serviceCharge: 150,
    ratings: 4,
    totalReview: 290,
    applicantNumber: 290,
    applicationDeadline: "2026-03-15",
    scholarshipPostDate: "2025-11-01",
    isExpired: false,
    description:
      "RCA's Global Talent Award supports outstanding international artists and designers joining its postgraduate programmes.",
  },
  {
    _id: "29",
    scholarshipName: "Parsons Design Excellence Scholarship",
    universityName: "The New School (Parsons)",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHifq_wybbE8foVqlnytQIqISU6EZdk2exYzF9kjSeLg&s=10",
    universityCountry: "USA",
    universityCity: "New York",
    universityLocation: "New York, USA",
    scholarshipCategory: "Partial fund",
    subjectCategory: "Arts",
    degree: "Bachelors",
    applicationFees: 4500,
    serviceCharge: 300,
    ratings: 4,
    totalReview: 175,
    applicantNumber: 175,
    applicationDeadline: "2026-01-15",
    scholarshipPostDate: "2025-09-01",
    isExpired: false,
    description:
      "Parsons awards merit scholarships to international students entering undergraduate design and fine arts programmes.",
  },
  {
    _id: "30",
    scholarshipName: "Japan MEXT Arts & Culture Scholarship",
    universityName: "Tokyo University of the Arts",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKoTNqFfPuu9dqM_GnRE3ZEKsdCs8Jk0rrYmXJ6obWew&s=10",
    universityCountry: "Japan",
    universityCity: "Tokyo",
    universityLocation: "Tokyo, Japan",
    scholarshipCategory: "Full fund",
    subjectCategory: "Arts",
    degree: "Masters",
    applicationFees: 0,
    serviceCharge: 0,
    ratings: 5,
    totalReview: 380,
    applicantNumber: 380,
    applicationDeadline: "2026-05-31",
    scholarshipPostDate: "2025-12-15",
    isExpired: false,
    description:
      "The Japanese Government (MEXT) Scholarship funds international students in arts and music at Japan's premier arts university.",
  },

  // ── Oxford / Chevening (Social Sciences) + extra ──────────────
  {
    _id: "2",
    scholarshipName: "Oxford Rhodes Scholarship",
    universityName: "University of Oxford",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDvROVMZkaTMScUiiYExWLGWIMzt2VdehMKs9Yir7SMQ&s=10",
    universityCountry: "UK",
    universityCity: "Oxford",
    universityLocation: "Oxford, UK",
    scholarshipCategory: "Full fund",
    subjectCategory: "Humanities",
    degree: "Masters",
    applicationFees: 45000,
    serviceCharge: 500,
    ratings: 5,
    totalReview: 988,
    applicantNumber: 988,
    applicationDeadline: "2026-02-28",
    scholarshipPostDate: "2025-05-15",
    isExpired: true,
    description:
      "The Rhodes Scholarships support exceptional students from around the world to study at the University of Oxford.",
  },
  {
    _id: "7",
    scholarshipName: "Chevening Scholarship",
    universityName: "University of Edinburgh",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT7SVvO1gC4fyj-isMkXk00tPzAD9rEib7cwpCAw4QXQ&s",
    universityCountry: "UK",
    universityCity: "Edinburgh",
    universityLocation: "Edinburgh, UK",
    scholarshipCategory: "Full fund",
    subjectCategory: "Social Sciences",
    degree: "Masters",
    applicationFees: 0,
    serviceCharge: 0,
    ratings: 5,
    totalReview: 920,
    applicantNumber: 920,
    applicationDeadline: "2026-11-05",
    scholarshipPostDate: "2025-07-15",
    isExpired: false,
    description:
      "Chevening Scholarships are the UK government's global scholarship programme funded by the FCDO.",
  },
  {
    _id: "5",
    scholarshipName: "TAFE NSW International Scholarship",
    universityName: "TAFE NSW",
    universityImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSerrPi_uNk4tptP_Df2dzAzbm8AIiBdWVimXn3q0QDnw&s=10",
    universityCountry: "Australia",
    universityCity: "Sydney",
    universityLocation: "Sydney, Australia",
    scholarshipCategory: "Self fund",
    subjectCategory: "Technology",
    degree: "Diploma",
    applicationFees: 5000,
    serviceCharge: 100,
    ratings: 4,
    totalReview: 75,
    applicantNumber: 75,
    applicationDeadline: "2026-09-01",
    scholarshipPostDate: "2025-09-10",
    isExpired: false,
    description:
      "TAFE NSW International Scholarships support international students pursuing vocational and technical education in Australia.",
  },
];

const users = [
  {
    _id: "1",
    displayName: "Admin User",
    email: "admin@gmail.com",
    photoURL: "",
    role: "admin",
    createdAt: new Date().toISOString(),
    isProtected: true,
  },
  {
    _id: "2",
    displayName: "Moderator User",
    email: "moderator@gmail.com",
    photoURL: "",
    role: "moderator",
    createdAt: new Date().toISOString(),
    isProtected: true,
  },
  {
    _id: "3",
    displayName: "Regular User",
    email: "user@gmail.com",
    photoURL: "",
    role: "user",
    createdAt: new Date().toISOString(),
    isProtected: true,
  },
];
const applications = [];
const reviews = [
  {
    _id: "r1",
    scholarshipId: "2",
    email: "student@example.com",
    reviewerName: "Ali Hassan",
    reviewerImage: "",
    rating: 5,
    reviewMessage:
      "Getting the Oxford Rhodes Scholarship was a life-changing experience. The application process was smooth and the support was amazing!",
    reviewDate: "2025-12-01",
  },
  {
    _id: "r2",
    scholarshipId: "3",
    email: "sara@example.com",
    reviewerName: "Sara Khan",
    reviewerImage: "",
    rating: 5,
    reviewMessage:
      "NUS scholarship gave me the opportunity to study in one of Asia's top universities. Highly recommend to all ASEAN students.",
    reviewDate: "2025-11-15",
  },
  {
    _id: "r3",
    scholarshipId: "7",
    email: "john@example.com",
    reviewerName: "John Smith",
    reviewerImage: "",
    rating: 4,
    reviewMessage:
      "Chevening was an incredible opportunity. The network you build is just as valuable as the education itself.",
    reviewDate: "2025-10-20",
  },
];
const wishlists = [];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
let nextId = 100;
const generateId = () => String(nextId++);

// ─────────────────────────────────────────────
// JWT MIDDLEWARE
// ─────────────────────────────────────────────
const verifyJWTToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).send({ message: "unauthorized access" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: "unauthorized access" });
    req.user = decoded;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  const user = users.find((u) => u.email === req.user?.email);
  if (!user || user.role !== "admin")
    return res.status(403).json({ message: "Forbidden access denied" });
  req.decoded = user.email;
  next();
};

const verifyModerator = (req, res, next) => {
  const user = users.find((u) => u.email === req.user?.email);
  if (!user || user.role !== "moderator")
    return res.status(403).json({ message: "Forbidden access denied" });
  next();
};

// ─────────────────────────────────────────────
// USERS API
// ─────────────────────────────────────────────
app.get("/users", verifyJWTToken, verifyAdmin, (req, res) => {
  const { search = "", filter = "", limit = 0, page = 1 } = req.query;
  let result = [...users];
  if (search) {
    const re = new RegExp(search, "i");
    result = result.filter((u) => re.test(u.displayName) || re.test(u.email));
  }
  if (filter) result = result.filter((u) => u.role === filter);
  const totalUsers = users.length;
  const skip = (Number(page) - 1) * Number(limit);
  if (Number(limit) > 0) result = result.slice(skip, skip + Number(limit));
  res.status(200).json({ users: result, totalUsers });
});

app.get("/users/:email/role", verifyJWTToken, (req, res) => {
  const { email } = req.params;
  if (req.user?.email !== email)
    return res.status(403).send({ message: "Forbidden: Email mismatch." });
  const user = users.find((u) => u.email === email);
  res.status(200).send({ role: user?.role || "student" });
});

app.post("/users", (req, res) => {
  const userInfo = {
    ...req.body,
    role: "student",
    createdAt: new Date().toISOString(),
  };
  if (users.find((u) => u.email === userInfo.email))
    return res.json({ message: "user already exits" });
  userInfo._id = generateId();
  users.push(userInfo);
  res.status(201).json({ insertedId: userInfo._id });
});

app.patch("/users/role/:id", verifyJWTToken, verifyAdmin, (req, res) => {
  const idx = users.findIndex((u) => u._id === req.params.id);
  if (idx === -1) return res.status(404).send({ message: "User not found" });
  if (users[idx].isProtected)
    return res
      .status(403)
      .send({ message: "Action Forbidden: This user is Protected." });
  if (users[idx].email === req.decoded)
    return res
      .status(403)
      .send({ message: "You cannot change your own role." });
  users[idx].role = req.body.role;
  res.send({ modifiedCount: 1 });
});

app.delete("/users/:id", verifyJWTToken, verifyAdmin, (req, res) => {
  const idx = users.findIndex((u) => u._id === req.params.id);
  if (idx === -1) return res.status(404).send({ message: "User not found" });
  if (users[idx].isProtected)
    return res
      .status(403)
      .send({ message: "Action Forbidden: Cannot delete a Protected User." });
  users.splice(idx, 1);
  res.send({ deletedCount: 1 });
});

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};

app.post("/getToken", (req, res) => {
  const token = jwt.sign(req.body, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.cookie("token", token, cookieOptions).send({ success: true });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions).send({ success: true });
});

// ─────────────────────────────────────────────
// TOP UNIVERSITIES
// ─────────────────────────────────────────────
app.get("/top-universities", (req, res) => {
  const seen = new Set();
  const result = [];
  for (const s of scholarships) {
    if (!seen.has(s.universityName)) {
      seen.add(s.universityName);
      result.push({
        universityName: s.universityName,
        universityImage: s.universityImage,
        universityCountry: s.universityCountry,
        count: scholarships.filter((x) => x.universityName === s.universityName)
          .length,
      });
    }
    if (result.length >= 20) break;
  }
  res.send(result);
});

// ─────────────────────────────────────────────
// SCHOLARSHIPS API
// ─────────────────────────────────────────────
app.get("/scholarships", (req, res) => {
  const {
    limit = 0,
    page = 1,
    schCat = "",
    subCat = "",
    loc = "",
    search = "",
    sort = "",
  } = req.query;

  let result = [...scholarships];

  if (schCat)
    result = result.filter((s) =>
      new RegExp(schCat, "i").test(s.scholarshipCategory),
    );
  if (subCat)
    result = result.filter((s) =>
      new RegExp(subCat, "i").test(s.subjectCategory),
    );
  if (loc)
    result = result.filter((s) =>
      new RegExp(loc, "i").test(s.universityCountry),
    );
  if (search) {
    const re = new RegExp(search, "i");
    result = result.filter(
      (s) =>
        re.test(s.scholarshipName) ||
        re.test(s.universityName) ||
        re.test(s.degree),
    );
  }

  if (sort === "asc")
    result.sort((a, b) => a.applicationFees - b.applicationFees);
  else if (sort === "dsc")
    result.sort((a, b) => b.applicationFees - a.applicationFees);
  else result.sort((a, b) => a.applicationFees - b.applicationFees);

  const totalScholaships = scholarships.length;
  const skip = (Number(page) - 1) * Number(limit);
  if (Number(limit) > 0) result = result.slice(skip, skip + Number(limit));

  res.status(200).json({ scholarships: result, totalScholaships });
});

app.get("/scholarship/:id", verifyJWTToken, (req, res) => {
  const scholarship = scholarships.find((s) => s._id === req.params.id);
  if (!scholarship) return res.status(404).json({ message: "Not found" });

  const recomended = scholarships
    .filter(
      (s) =>
        s.scholarshipCategory === scholarship.scholarshipCategory &&
        s._id !== scholarship._id,
    )
    .slice(0, 3);

  res.status(200).json({ details: scholarship, recomended });
});

app.post("/add-scholarship", verifyJWTToken, verifyAdmin, (req, res) => {
  const newScholarship = { ...req.body, _id: generateId() };
  scholarships.push(newScholarship);
  res.status(201).json({ insertedId: newScholarship._id });
});

app.patch("/scholarship/:id", verifyJWTToken, verifyAdmin, (req, res) => {
  const idx = scholarships.findIndex((s) => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  Object.assign(scholarships[idx], req.body);
  res.status(200).json({ modifiedCount: 1 });
});

app.delete("/scholarship/:id", verifyJWTToken, (req, res) => {
  const { adminEmail } = req.query;
  if (adminEmail !== req.user.email)
    return res.status(403).json({ message: "Forbidden: Email mismatch." });
  const idx = scholarships.findIndex((s) => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  scholarships.splice(idx, 1);
  res.status(200).json({ deletedCount: 1 });
});

// ─────────────────────────────────────────────
// APPLICATIONS API
// ─────────────────────────────────────────────
const STATUS_PRIORITY = {
  pending: 0,
  processing: 1,
  completed: 2,
  rejected: 3,
};

app.get("/applications", verifyJWTToken, verifyModerator, (req, res) => {
  const { email } = req.query;
  if (email !== req.user?.email)
    return res.status(403).json({ message: "access forbidden" });
  const result = [...applications].sort(
    (a, b) =>
      (STATUS_PRIORITY[a.applicationStatus] ?? 99) -
      (STATUS_PRIORITY[b.applicationStatus] ?? 99),
  );
  res.status(200).json(result);
});

app.get("/applications/:email/byUser", verifyJWTToken, (req, res) => {
  const result = applications.filter((a) => a.userEmail === req.params.email);
  res.status(200).json(result);
});

app.get("/applications/:id", verifyJWTToken, (req, res) => {
  const app_ = applications.find((a) => a._id === req.params.id);
  if (!app_) return res.status(404).json({ message: "Not found" });
  res.status(200).json(app_);
});

app.patch("/applications/:id", verifyJWTToken, (req, res) => {
  const idx = applications.findIndex((a) => a._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  Object.assign(applications[idx], req.body);
  res.status(200).json({ modifiedCount: 1 });
});

app.patch(
  "/applications/feedback/:id",
  verifyJWTToken,
  verifyModerator,
  (req, res) => {
    const idx = applications.findIndex((a) => a._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Not found" });
    Object.assign(applications[idx], req.body);
    res.status(200).json({ modifiedCount: 1 });
  },
);

app.delete("/applications/:id", verifyJWTToken, (req, res) => {
  const idx = applications.findIndex(
    (a) => a._id === req.params.id && a.applicationStatus === "pending",
  );
  if (idx === -1)
    return res.status(404).json({ message: "Not found or not pending" });
  applications.splice(idx, 1);
  res.status(200).json({ deletedCount: 1 });
});

// ─────────────────────────────────────────────
// REVIEWS API
// ─────────────────────────────────────────────
app.get("/reviews", verifyJWTToken, verifyModerator, (req, res) => {
  res.status(200).json(reviews);
});

app.get("/top-reviews", (req, res) => {
  const result = reviews
    .filter((r) => r.rating >= 4)
    .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate))
    .slice(0, 6);
  res.send(result);
});

app.get("/reviews/user/:email", verifyJWTToken, (req, res) => {
  res.status(200).json(reviews.filter((r) => r.email === req.params.email));
});

app.get("/reviews/:id", verifyJWTToken, (req, res) => {
  res
    .status(200)
    .json(reviews.filter((r) => r.scholarshipId === req.params.id));
});

app.post("/reviews", verifyJWTToken, (req, res) => {
  const reviewsInfo = req.body;
  const idx = reviews.findIndex(
    (r) =>
      r.email === reviewsInfo.email &&
      r.scholarshipId === reviewsInfo.scholarshipId,
  );
  if (idx !== -1) {
    Object.assign(reviews[idx], {
      ...reviewsInfo,
      updatedDate: new Date().toISOString(),
    });
  } else {
    reviews.push({
      ...reviewsInfo,
      _id: generateId(),
      createdAt: new Date().toISOString(),
    });
  }

  // Recalculate average rating on the scholarship
  const schReviews = reviews.filter(
    (r) => r.scholarshipId === reviewsInfo.scholarshipId,
  );
  const avg =
    schReviews.reduce((sum, r) => sum + r.rating, 0) / schReviews.length;
  const schIdx = scholarships.findIndex(
    (s) => s._id === reviewsInfo.scholarshipId,
  );
  if (schIdx !== -1) {
    scholarships[schIdx].ratings = Math.round(avg / 5) * 5;
    scholarships[schIdx].totalReview = schReviews.length;
  }

  res.status(200).json({ modifiedCount: 1 });
});

app.delete("/reviews/:id", verifyJWTToken, (req, res) => {
  const idx = reviews.findIndex((r) => r._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  reviews.splice(idx, 1);
  res.status(200).json({ deletedCount: 1 });
});

// ─────────────────────────────────────────────
// HOME STATS
// ─────────────────────────────────────────────
app.get("/home-stats", (req, res) => {
  res.send({
    scholarshipCount: scholarships.length,
    applicationCount: applications.length,
    userCount: users.filter((u) => u.role === "student").length,
    reviewCount: reviews.length,
  });
});

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────
app.get("/analytics", (req, res) => {
  const totalScholaships = scholarships.length;
  const totalUsers = users.length;
  const totalFees = applications.reduce(
    (sum, a) => sum + (a.amountPaid || 0),
    0,
  );

  const categoryMap = {};
  applications.forEach((a) => {
    categoryMap[a.scholarshipCategory] =
      (categoryMap[a.scholarshipCategory] || 0) + 1;
  });
  const appsByCategory = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const universityMap = {};
  applications.forEach((a) => {
    universityMap[a.universityName] =
      (universityMap[a.universityName] || 0) + 1;
  });
  const appsByUniversity = Object.entries(universityMap)
    .map(([universityName, count]) => ({ universityName, count }))
    .sort((a, b) => b.count - a.count);

  res.send({
    totalScholaships,
    totalUsers,
    totalFees,
    appsByCategory,
    appsByUniversity,
  });
});

// ─────────────────────────────────────────────
// WISHLISTS API
// ─────────────────────────────────────────────
app.get("/wishlists", verifyJWTToken, (req, res) => {
  const { email } = req.query;
  if (req.user.email !== email)
    return res.status(403).send({ message: "Forbidden access" });

  const result = wishlists
    .filter((w) => w.userEmail === email)
    .map((w) => {
      const sch = scholarships.find((s) => s._id === w.scholarshipId);
      if (!sch) return null;
      return {
        _id: w._id,
        scholarshipId: w.scholarshipId,
        userEmail: w.userEmail,
        universityName: sch.universityName,
        scholarshipName: sch.scholarshipName,
        universityImage: sch.universityImage,
        scholarshipCategory: sch.scholarshipCategory,
        degree: sch.degree,
        applicationFees: sch.applicationFees,
        serviceCharge: sch.serviceCharge,
        universityLocation: `${sch.universityCity}, ${sch.universityCountry}`,
      };
    })
    .filter(Boolean);

  res.send(result);
});

app.get("/wishlists/check/:scholarshipId", verifyJWTToken, (req, res) => {
  const { scholarshipId } = req.params;
  const { email } = req.query;
  const found = wishlists.find(
    (w) => w.scholarshipId === scholarshipId && w.userEmail === email,
  );
  res.send(
    found ? { isSaved: true, id: found._id } : { isSaved: false, id: null },
  );
});

app.post("/wishlists", verifyJWTToken, (req, res) => {
  const wishlistInfo = {
    ...req.body,
    _id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const exists = wishlists.find(
    (w) =>
      w.scholarshipId === wishlistInfo.scholarshipId &&
      w.userEmail === wishlistInfo.userEmail,
  );
  if (exists)
    return res
      .status(200)
      .json({ success: false, message: "already in wishlist" });
  wishlists.push(wishlistInfo);
  res.status(201).json({ insertedId: wishlistInfo._id });
});

app.delete("/wishlists/:id", verifyJWTToken, (req, res) => {
  const idx = wishlists.findIndex((w) => w._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  wishlists.splice(idx, 1);
  res.status(200).json({ deletedCount: 1 });
});

// ─────────────────────────────────────────────
// PAYMENT API
// ─────────────────────────────────────────────
app.post("/create-checkout-session", verifyJWTToken, async (req, res) => {
  const {
    scholarshipId,
    scholarshipName,
    universityImage,
    userName,
    universityName,
    universityCity,
    universityCountry,
    scholarshipCategory,
    subjectCategory,
    degree,
    applicationFees,
    serviceCharge,
    totalPrice,
    phone,
    photoURL,
    address,
    gender,
    studyGap,
    sscResult,
    hscResult,
  } = req.body;

  const tokenEmail = req.user.email;
  if (req.body.userEmail !== tokenEmail)
    return res
      .status(403)
      .send({ message: "Forbidden: You can only apply for yourself" });

  const userEmail = tokenEmail;

  const isScholarshipExits = scholarships.find((s) => s._id === scholarshipId);
  if (!isScholarshipExits)
    return res.status(404).json({ message: "Scholarship not found" });

  const isExitsApplication = applications.find(
    (a) => a.scholarshipId === scholarshipId && a.userEmail === userEmail,
  );

  if (isExitsApplication) {
    if (isExitsApplication.paymentStatus === "unpaid") {
      return res.json({
        message:
          "You have a pending application. Please pay from your dashboard.",
        insertedId: null,
      });
    } else {
      return res.json({
        message:
          "You have already completed the application for this scholarship.",
        insertedId: null,
      });
    }
  }

  const applicationInfo = {
    _id: generateId(),
    phone,
    photoURL,
    address,
    gender,
    studyGap,
    sscResult,
    hscResult,
    scholarshipId,
    userEmail,
    userName,
    universityName,
    universityCity,
    universityImage,
    scholarshipName,
    universityCountry,
    scholarshipCategory,
    subjectCategory,
    degree,
    applicationFees,
    serviceCharge,
    applicationStatus: "pending",
    paymentStatus: "unpaid",
    applicationDate: new Date().toISOString(),
  };
  applications.push(applicationInfo);

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Application for: ${scholarshipName}`,
            description: `University: ${universityName}`,
            images: [universityImage],
          },
          unit_amount: Math.round(totalPrice * 100),
        },
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    mode: "payment",
    metadata: { applicationId: applicationInfo._id, scholarshipId, userEmail },
    success_url: `${process.env.DOMAIN_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN_URL}/payment/fail?scholarshipName=${scholarshipName}`,
  });

  res.json({ url: session.url });
});

app.post("/retry-payment/:id", verifyJWTToken, async (req, res) => {
  const application = applications.find((a) => a._id === req.params.id);
  if (!application)
    return res.status(404).send({ message: "Application not found" });
  if (application.userEmail !== req.user.email)
    return res.status(403).send({ message: "Forbidden Access" });

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Application for: ${application.scholarshipName}`,
              description: `University: ${application.universityName}`,
              images: [application.universityImage],
            },
            unit_amount: Math.round(
              (application.applicationFees + application.serviceCharge) * 100,
            ),
          },
          quantity: 1,
        },
      ],
      customer_email: application.userEmail,
      mode: "payment",
      metadata: {
        applicationId: req.params.id,
        scholarshipId: application.scholarshipId,
        userEmail: application.userEmail,
      },
      success_url: `${process.env.DOMAIN_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN_URL}/payment/fail?scholarshipName=${application.scholarshipName}`,
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.patch("/payment/success", verifyJWTToken, async (req, res) => {
  const { sessionId } = req.body;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const { amount_total, metadata, payment_intent, payment_status } = session;
    const tokenEmail = req.user.email;

    if (!metadata?.applicationId || !metadata?.userEmail)
      return res
        .status(400)
        .send({ success: false, message: "Invalid Session Metadata" });

    const { applicationId, userEmail, scholarshipId } = metadata;
    if (tokenEmail !== userEmail)
      return res
        .status(403)
        .send({ success: false, message: "Forbidden: Email mismatch." });

    if (payment_status === "paid") {
      const idx = applications.findIndex((a) => a._id === applicationId);
      if (idx === -1)
        return res
          .status(404)
          .send({ success: false, message: "Application not found" });

      if (applications[idx].paymentStatus === "paid") {
        return res.status(200).json({
          success: true,
          message: "Already Paid",
          data: applications[idx],
        });
      }

      Object.assign(applications[idx], {
        paymentStatus: payment_status,
        transactionId: payment_intent,
        amountPaid: amount_total / 100,
      });

      const schIdx = scholarships.findIndex((s) => s._id === scholarshipId);
      if (schIdx !== -1)
        scholarships[schIdx].applicantNumber =
          (scholarships[schIdx].applicantNumber || 0) + 1;

      return res.status(200).json({
        success: true,
        data: applications[idx],
        message: "Payment confirmed",
      });
    } else {
      return res
        .status(400)
        .send({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Payment Error:", error);
    return res
      .status(500)
      .send({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("ScholarPath server is running!");
});

app.listen(port, () => {
  console.log(`ScholarPath app listening on port ${port}`);
});
