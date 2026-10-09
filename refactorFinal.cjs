const fs = require('fs');
const path = require('path');

const refactors = [
  {
    path: 'apps/frontend/src/pages/alumni/Donations.jsx',
    search: `  const [donations, setDonations] = useState([
    { id: 1, amount: 500, purpose: 'Scholarship', date: '2025-12-10', status: 'Completed' },
    { id: 2, amount: 250, purpose: 'Infrastructure', date: '2026-05-20', status: 'Completed' }
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 100);
  }, []);`,
    replace: `  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const { campaignService } = await import('../../services/api');
        const res = await campaignService.getCampaigns();
        setDonations(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);`
  },
  {
    path: 'apps/frontend/src/pages/community/Forum.jsx',
    search: `  const posts = [
    {
      id: 1,
      title: "How to ace the System Design interview at FAANG?",
      author: "Alex J. (Alumni)",
      authorRole: "SDE @ Google",
      content: "I recently cleared my Google interview and wanted to share the resources I used. Focus heavily on load balancers, caching strategies, and database sharding...",
      tags: ["Interviews", "System Design", "FAANG"],
      upvotes: 342,
      comments: 45,
      time: "2h ago",
      isTrending: true
    },
    {
      id: 2,
      title: "Need teammates for the upcoming Web3 Hackathon!",
      author: "Sarah D. (Student)",
      authorRole: "CS Junior",
      content: "Looking for a frontend developer who knows React and Tailwind. We have a solid backend Dev and a UI/UX designer. Prize pool is $10k!",
      tags: ["Hackathons", "Web3", "Frontend"],
      upvotes: 89,
      comments: 12,
      time: "5h ago",
      isTrending: false
    },
    {
      id: 3,
      title: "Is it worth taking Advanced Compilers next semester?",
      author: "Michael B. (Student)",
      authorRole: "CS Senior",
      content: "I've heard Dr. Smith's class is notoriously difficult. For those who took it, did it actually help in your career or was it just academic torture?",
      tags: ["Academics", "Course Review"],
      upvotes: 56,
      comments: 28,
      time: "1d ago",
      isTrending: false
    }
  ];`,
    replace: `  const [posts, setPosts] = useState([]);

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { communityService } = await import('../../services/api');
        const res = await communityService.getPosts();
        setPosts(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPosts();
  }, []);`
  },
  {
    path: 'apps/frontend/src/pages/alumni/Donations.jsx',
    search: `key={donation.id}`,
    replace: `key={donation._id || donation.id}`
  },
  {
    path: 'apps/frontend/src/pages/community/Forum.jsx',
    search: `key={post.id}`,
    replace: `key={post._id || post.id}`
  },
  {
    path: 'apps/frontend/src/pages/community/Forum.jsx',
    search: `{post.tags.map(tag => (`,
    replace: `{(post.tags || []).map(tag => (`
  }
];

refactors.forEach(r => {
  const fullPath = path.join(__dirname, r.path);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes(r.search)) {
      content = content.replace(r.search, r.replace);
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Successfully refactored:', r.path);
    } else {
      console.log('Search block not found in:', r.path);
    }
  }
});
