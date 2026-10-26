// Data and long-form copy; headings and short labels live in their components.
const img = (name: string) => `/image-uploads/${name}`

export const profile = {
  name: 'Krishna Somani',
  tagline:
    'I build AI that survives production: models for the judgment calls, code for the parts that can’t be wrong. I’ve shipped enterprise agents at Rocketlane and WhatsApp commerce at PharmEasy, and most weekends I’m at a hackathon building whatever comes next.',
  bio: 'Applied AI engineer turning language models, retrieval and vision into products people rely on.',
  photo: img('krishna-somani.webp'),
  // Served from public/. To update it, replace that file (keep the name) and push; the host redeploys it
  resume: '/Krishna-Somani-Resume.pdf',
  email: 'kr7shnasomani@gmail.com',
}

export const socials = [
  { label: 'GitHub', href: 'https://github.com/kr7shnasomani', icon: '/socials/github.svg', color: '#181717' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kr7shnasomani', icon: '/socials/linkedin.svg', color: '#0a66c2' },
  // Kaggle is off for now; uncomment to show it again
  // { label: 'Kaggle', href: 'https://www.kaggle.com/kr7shnasomani', icon: '/socials/kaggle.svg', color: '#20beff' },
  // LeetCode is off for now; uncomment to show it again (its full-colour hover logo is leetcode-color.svg)
  // { label: 'LeetCode', href: 'https://leetcode.com/u/kr7shnasomani/', icon: '/socials/leetcode.svg', color: "url('/socials/leetcode-color.svg') center / contain no-repeat" },
  { label: 'X', href: 'https://x.com/kr7shnasomani', icon: '/socials/x.svg', color: '#000000' },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/kr7shnasomani/',
    icon: '/socials/instagram.svg',
    color: 'radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285aeb 90%)',
  },
]

export const education = [
  { institution: 'SRM IST Chennai', period: 'Aug 2023 – Apr 2027', logo: '/schools/srm.webp' },
  { institution: 'St. John’s Public School', period: 'Jun 2021 – May 2023', logo: '/schools/sjps.webp' },
  { institution: 'The PSBB Millennium School', period: 'Jun 2011 – Mar 2021', logo: '/schools/psbb.webp' },
] satisfies [object, object, object] // Education.tsx sets three towers and names each school in its intro

export const experience = [
  {
    company: 'Rocketlane',
    role: 'Forward Deployed Engineer Intern',
    period: 'Aug 2026 – Present',
    location: 'Chennai · On-site',
    logo: '/companies/rocketlane.webp',
    summary:
      'Deploying production AI agents, custom apps and internal tooling on Rocketlane’s agentic platform (Nitro) across 10+ enterprise accounts, including Nitro’s 2 largest customers and key PoC conversions.',
    points: [
      'Built and demoed 7 production AI agents across strategic PoCs and pilot conversions, automating 80+ page SOWs (~1 min), guarded project setups (~2 min vs. 2–3 week handoffs), 24-slide kickoff decks (~35s) and 313-item requirements docs (80% vs. 56% accuracy, zero fabricated answers).',
      'Delivered a full-stack custom app (~60 country projects within a 20s server limit) and a sub-30s Excel generator for one of Nitro’s 2 largest customers, and rebuilt a reporting agent for the other (runtime from 30–40 min to 2–3 min, credit cost down 65%).',
      'Cut LLM run costs 60–65% by replacing multi-turn prompts with deterministic Python, built an internal Claude Code plugin (local runtime simulator and credit estimator) for the FDE team, and surfaced 12+ platform bugs to Engineering.',
    ],
  },
  {
    company: 'PharmEasy',
    role: 'Data Scientist Intern',
    period: 'Jun 2025 – Nov 2025',
    location: 'Bengaluru · Hybrid',
    logo: '/companies/pharmeasy.webp',
    summary: 'Rebuilt PharmEasy’s WhatsApp chatbot infrastructure from a rigid rule-based system into a GPT-4.1 mini powered agentic platform on Dify, reducing maintenance overhead by 70%.',
    points: [
      'Architected and deployed two production WhatsApp chatbots across medicine delivery and lab diagnostics: search over 100,000+ products and 500+ tests, prescription uploads, cart and address management, slot booking and order placement.',
      'Engineered 20+ modular agentic workflows and LLM function-calling pipelines over PharmEasy REST APIs, handling input structuring, API orchestration, response parsing and natural language synthesis.',
      'Held sub-2-second end-to-end response latency across the Dify orchestration layer, PharmEasy backend APIs and the Gupshup WhatsApp gateway.',
    ],
  },
  {
    company: 'Accuracy',
    role: 'Data Engineer Intern',
    period: 'Jun 2024 – Jul 2024',
    location: 'Hyderabad · Remote',
    logo: '/companies/accuracy.webp',
    summary: 'Automated large-scale job market data acquisition and exploratory labour-market analytics, cutting scraper maintenance overhead by 60%.',
    points: [
      'Unified extraction across paginated listings, infinite-scroll feeds and dynamic detail views into a single modular Python scraping architecture using Selenium and Beautiful Soup.',
      'Ran exploratory and textual analysis on 1,000+ job postings to surface regional hiring trends, role saturation and high-demand technical skill clusters.',
    ],
  },
] satisfies [object, object, object] // Experience.tsx draws exactly three stations on the route map

// The site's gradients [front, side, top]: city boxes, towers, card glows and toolkit frames
export const palettes = [
  ['linear-gradient(224.9deg,#ffb5d1 9.7%,#6374ff 68.3%)', 'linear-gradient(180deg,#d980ff,#4c1ed7)', 'linear-gradient(270deg,#ffb5d1 9.7%,#6374ff 68.3%)'],
  ['linear-gradient(180deg,#57c8ff 7%,#faaedf 89.6%,#faaebd 120.4%)', 'linear-gradient(180deg,#676cd7,#b787ff)', 'linear-gradient(270deg,#57c8ff 7%,#faaedf 89.6%,#faaebd 120.4%)'],
  [
    'linear-gradient(0deg,#8fffc6 3.2%,#b2ffa6 54%,#faaedf 76.8%,#fd79ae 107%)',
    'linear-gradient(180deg,#c58dbf,#4a41c7)',
    'linear-gradient(90deg,#8fffc6 3.2%,#b2ffa6 54%,#faaedf 76.8%,#fd79ae 107%)',
  ],
  ['linear-gradient(218.4deg,#f3dd99 2.9%,#ff71b2 86%,#ce47ff 100%)', 'linear-gradient(180deg,#ce47ff,#ff72b1,#f7b6a2)', 'linear-gradient(270deg,#f3dd99 2.9%,#ff71b2 86%,#ce47ff 100%)'],
  ['linear-gradient(200deg,#f3dd99 0%,#f985c5 45%,#664ca3 100%)', 'linear-gradient(180deg,#9b7bff,#3b2f61)', 'linear-gradient(270deg,#f3dd99 0%,#f985c5 45%,#664ca3 100%)'],
]

export const projects = [
  {
    title: 'Kairos',
    description: 'Turns a plant’s scattered maintenance records into cited answers, early warnings and pre-job briefs on a governed, temporal knowledge graph.',
    href: 'https://github.com/kr7shnasomani/kairos',
    logo: '/projects/kairos.webp',
  },
  {
    title: 'Lexora',
    description: 'Insurance claims engine: document extraction, policy checks and fraud detection, through to a decision.',
    href: 'https://github.com/kr7shnasomani/lexora',
    logo: '/projects/lexora.webp',
  },
  {
    title: 'Argus',
    description: 'Resolves IT tickets with vector search, LLM reasoning and live sandbox validation.',
    href: 'https://github.com/kr7shnasomani/argus',
    logo: '/projects/argus.webp',
  },
  {
    title: 'Claude Token Counter',
    description: 'Browser extension used by 11,000+ people for live token counts, cache timers and usage bars on claude.ai.',
    href: 'https://github.com/kr7shnasomani/claude-token-counter',
    logo: '/projects/claude-token-counter.webp',
  },
]

// Peer-reviewed papers, newest first. `link` is left out until the paper is publicly available; its label names the site it opens.
export const publications: { title: string; venue: string; logo: string; authors: string[]; summary: string; link?: { href: string; label: string } }[] = [
  {
    title: 'A Deep Learning–Based Framework for Blood Group Prediction Using Fingerprint Image Patterns',
    venue: 'IEEE ICNPCV 2026',
    logo: '/venues/ieee.svg',
    authors: ['Sarthak Lal', 'Krishna Somani', 'Sudha D'],
    summary:
      'A modified ResNet9 that predicts blood group directly from fingerprint ridge and texture patterns, a non-invasive alternative to lab typing. It reached 91.43% accuracy across all eight blood groups, 44 points above a handcrafted-feature baseline.',
    link: { href: 'https://ieeexplore.ieee.org/document/11709007', label: 'Read on IEEE Xplore' },
  },
  {
    title: 'Multi-Objective Optimized Deep Learning Framework for Spatio-Temporal Air Pollution Forecasting Using Remote Sensing and IoT Data Fusion',
    venue: 'International Journal of Intelligent Systems and Applications, MECS Press',
    logo: '/venues/mecs.webp', // IJISA has no mark of its own; this is its publisher, MECS Press
    authors: ['Sudha D', 'Krishna Somani', 'Sarthak Lal'],
    summary:
      'Forecasts PM2.5, NO₂ and CO₂ 24 hours ahead by fusing 12 IoT ground sensors across Beijing with NASA MERRA-2 and CAMS satellite reanalysis. A BiLSTM with an XGBoost-Dart residual correction layer reached R² 0.9645 for PM2.5, explained with 1D Grad-CAM and SHAP.',
  },
]

// Newest first, in Krishna's own words. `image` is the framed shot; `full`, when set, is the uncropped one shown on click.
// Organisations named in the achievement descriptions, written there as {key}. Each renders as its icon and name,
// linking to its official site. Entries without `href` are names whose site couldn't be confirmed, and stay plain text.
// Government of India carries the State Emblem (the site owner's call, knowing its use is restricted under the State
// Emblem of India (Prohibition of Improper Use) Act); the ministry and department, whose mark is the same emblem, don't.
type Org = { name: string; href?: string; logo?: string }
export const orgs: Record<string, Org> = {
  lovable: { name: 'Lovable', href: 'https://lovable.dev', logo: '/orgs/lovable.svg' },
  xyz: { name: '.xyz', href: 'https://gen.xyz', logo: '/orgs/xyz.svg' },
  et: { name: 'The Economic Times', href: 'https://economictimes.indiatimes.com', logo: '/orgs/economictimes.webp' },
  thub: { name: 'T-Hub', href: 'https://t-hub.co', logo: '/orgs/thub.webp' },
  octave: { name: 'Octave', href: 'https://www.octave.com', logo: '/orgs/octave.svg' },
  posspole: { name: 'Posspole', href: 'https://posspole.com', logo: '/orgs/posspole.webp' },
  unstop: { name: 'Unstop', href: 'https://unstop.com', logo: '/orgs/unstop.webp' },
  atos: { name: 'Atos', href: 'https://atos.net', logo: '/orgs/atos.svg' },
  guidewire: { name: 'Guidewire', href: 'https://www.guidewire.com', logo: '/orgs/guidewire.svg' },
  ey: { name: 'EY', href: 'https://www.ey.com', logo: '/orgs/ey.webp' },
  nia: { name: 'National Insurance Academy', href: 'https://www.niapune.org.in', logo: '/orgs/nia.webp' },
  sjce: { name: 'St. Joseph’s College of Engineering', href: 'https://stjosephs.ac.in', logo: '/orgs/sjce.webp' },
  ads: { name: 'Data Analytics Club ADS' },
  wareef: { name: 'Wareef' },
  cplc: { name: 'CPLC' },
  goi: { name: 'Government of India', href: 'https://www.india.gov.in', logo: '/orgs/goi.webp' },
  mof: { name: 'Ministry of Finance', href: 'https://finmin.gov.in' },
  dfs: { name: 'Department of Financial Services', href: 'https://financialservices.gov.in' },
  boi: { name: 'Bank of India', href: 'https://bankofindia.co.in', logo: '/orgs/boi.webp' },
  iith: { name: 'IIT Hyderabad', href: 'https://www.iith.ac.in', logo: '/orgs/iith.webp' },
  idrbt: { name: 'IDRBT', href: 'https://www.idrbt.ac.in', logo: '/orgs/idrbt.webp' },
  temenos: { name: 'Temenos', href: 'https://www.temenos.com', logo: '/orgs/temenos.webp' },
  annauniv: { name: 'Anna University', href: 'https://www.annauniv.edu', logo: '/orgs/annauniv.webp' },
}

export const achievements = [
  {
    title: 'Hack Devengers 2.0',
    highlight: 'Top 20.',
    date: 'Sep 2026',
    description: 'Secured a Top 20 position at Hack Devengers 2.0, a hackathon featuring 1,500+ project submissions, sponsored by {lovable} and {xyz}.',
    // Zoomed onto the outlined leaderboard row; the whole board opens on click
    image: img('Hack Devengers 2.0 crop.webp'),
    full: img('Hack Devengers 2.0.webp'),
  },
  {
    title: 'ET AI Hackathon 2.0',
    highlight: 'Top 28.',
    date: 'Aug 2026',
    description:
      'Reached the finale of ET AI Hackathon 2.0 out of 15,000+ registered teams (9,629 cleared Round 1), at {thub}, Hyderabad. Organised by {et}, with industry partner {octave}, associate partner {posspole} and hackathon partner {unstop}.',
    image: img('ET AI Hackathon 2.0.webp'),
  },
  {
    title: 'SRiJAN 2026',
    highlight: 'Winner.',
    date: 'May 2026',
    description:
      'A national-level hackathon organised by {atos}. Won a ₹10,000 cash prize as part of a team for building Argus, an AI system for automated IT support ticket resolution using a confidence-based decision pipeline with vector search, LLM reasoning and live sandbox validation.',
    image: img('SRiJAN 2026.webp'),
    // Wider than the frame: shift the crop right so the Atos wall and everyone on the right stay in view
    focus: '80% 50%',
  },
  {
    title: 'DEVTrails University Hackathon 2026',
    highlight: 'Top 12.',
    date: 'Apr 2026',
    description: 'An 8-week InsurTech hackathon by {guidewire} in collaboration with {ey} and the {nia}, with more than 4,400 teams and over 18,000 participants competing nationally.',
    image: img('DEVTrails University Hackathon 2026 crop.webp'),
    full: img('DEVTrails University Hackathon 2026.webp'),
  },
  {
    title: 'Impact-AI-thon 2026',
    highlight: 'Runner-up.',
    date: 'Feb 2026',
    description: 'Won ₹30,000 as Runner-Up at Impact-AI-thon 2026, a 24-hour national-level hackathon organised by {sjce} and {ads}, sponsored by {wareef} and {cplc}.',
    image: img('Impact-AI-thon.webp'),
    // Portrait shot in a landscape frame: sit the crop high so faces and the cheque both stay in view
    focus: '50% 25%',
  },
  {
    title: 'FinShield Hackathon 2025',
    highlight: 'Top 9.',
    date: 'Sep 2025',
    description: 'Part of the PSBs Hackathon Series 2025, an initiative by the {goi}, {mof} and {dfs}, hosted by {boi}, {iith} and {idrbt}. Competed for a ₹20,00,000 prize pool.',
    image: img('FinShield Hackathon 2025.webp'),
  },
  {
    title: 'Temenos Tem-E-thon 2025',
    highlight: 'Winner.',
    date: 'Feb 2025',
    description:
      'A national-level 24-hour hackathon by {temenos} at {annauniv}, Chennai, with 1,000+ teams competing. Won as part of a team, awarded a 15-inch MacBook Air M3 from a ₹10,00,000 prize pool.',
    image: img('Temenos Tem-E-thon 2025 Hackathon Winner.webp'),
  },
]

// Filter tabs for the toolkit grid, in display order: AI and data stores first, the ML stack last.
// Each tab has its own caption.
export const toolkitCaption = 'What my agents, data pipelines and models are built on.'
export const skillGroups = [
  { id: 'data', label: 'AI & data', caption: 'Agent frameworks, vector and graph stores, and the databases under them.' },
  { id: 'eng', label: 'Engineering', caption: 'APIs, cloud, containers and the tooling that ships them.' },
  { id: 'ml', label: 'Machine learning', caption: 'Training, vision, language and the scientific Python stack.' },
] as const

type Group = (typeof skillGroups)[number]['id']
const tool = (name: string, file: string, group: Group, href: string) => ({ name, icon: img(file), group, href })

export const skills = [
  tool('LangChain', 'LangChain.svg', 'data', 'https://www.langchain.com'),
  tool('Dify', 'Dify.webp', 'data', 'https://dify.ai'),
  tool('n8n', 'n8n.png', 'data', 'https://n8n.io'),
  tool('Qdrant', 'Qdrant.webp', 'data', 'https://qdrant.tech'),
  tool('Neo4j', 'Neo4j.webp', 'data', 'https://neo4j.com'),
  tool('Supabase', 'Supabase.webp', 'data', 'https://supabase.com'),
  tool('PostgreSQL', 'PostgreSQL.webp', 'data', 'https://www.postgresql.org'),
  tool('Redis', 'Redis.svg', 'data', 'https://redis.io'),
  tool('FastAPI', 'FastAPI.svg', 'eng', 'https://fastapi.tiangolo.com'),
  tool('Docker', 'Docker.svg', 'eng', 'https://www.docker.com'),
  tool('AWS', 'AWS.svg', 'eng', 'https://aws.amazon.com'),
  tool('Git', 'Git.webp', 'eng', 'https://git-scm.com'),
  tool('GitHub', 'GitHub.webp', 'eng', 'https://github.com'),
  tool('Postman', 'Postman.webp', 'eng', 'https://www.postman.com'),
  tool('Selenium', 'Selenium.webp', 'eng', 'https://www.selenium.dev'),
  tool('Python', 'Python.webp', 'ml', 'https://www.python.org'),
  tool('PyTorch', 'PyTorch.webp', 'ml', 'https://pytorch.org'),
  tool('TensorFlow', 'TensorFlow.webp', 'ml', 'https://www.tensorflow.org'),
  tool('Keras', 'Keras.webp', 'ml', 'https://keras.io'),
  tool('scikit-learn', 'scikit-learn.webp', 'ml', 'https://scikit-learn.org'),
  tool('Hugging Face', 'Transformers.webp', 'ml', 'https://huggingface.co'),
  tool('OpenCV', 'OpenCV.webp', 'ml', 'https://opencv.org'),
  tool('spaCy', 'spaCy.webp', 'ml', 'https://spacy.io'),
  tool('NumPy', 'NumPy.webp', 'ml', 'https://numpy.org'),
  tool('pandas', 'pandas.webp', 'ml', 'https://pandas.pydata.org'),
  tool('Matplotlib', 'Matplotlib.webp', 'ml', 'https://matplotlib.org'),
  tool('seaborn', 'seaborn.webp', 'ml', 'https://seaborn.pydata.org'),
]

export const sections = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'publications', label: 'Publications' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Connect' },
]
