import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  ShieldCheck, 
  User, 
  HardHat, 
  ChevronRight, 
  MapPin, 
  Search, 
  MessageSquare, 
  Bell, 
  Star,
  AlertCircle,
  Users,
  Send,
  ArrowLeft,
  DollarSign,
  Lock,
  Mail,
  Camera,
  Upload,
  Check,
  Plus,
  Globe,
  LogOut,
  SlidersHorizontal,
  X,
  Shield,
  Clock,
  Zap,
  Award,
  Flag,
  Calendar,
  ThumbsUp,
  Video,
  Image,
  FileText,
  Paperclip,
  MoreVertical,
  Info,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  CheckCircle,
  History,
  CreditCard,
  Wallet,
  Receipt,
  ShieldAlert,
  Bookmark,
  ChevronDown,
  Menu,
  Filter,
  Settings,
  HelpCircle,
  Share2,
  Heart,
  Home,
  Power,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type UserRole = 'client' | 'worker';
type AuthStep = 'splash' | 'onboarding' | 'phone' | 'otp' | 'profile-setup' | 'role-selection' | 'worker-activation' | 'main';

interface UserData {
  id: string;
  phone: string;
  email?: string;
  role: UserRole;
  isWorkerVerified: boolean;
  name?: string;
  photo?: string;
  skills?: string[];
}

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  type?: 'text' | 'photo' | 'video' | 'meeting' | 'estimate';
  mediaUrl?: string;
  isEstimate?: boolean;
  estimateAmount?: string;
  createdAt: Date;
  blocked?: boolean;
  meetingDetails?: {
    date: string;
    time: string;
    location: string;
  };
}

type JobStatus = 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';

interface Job {
  id: string;
  clientId: string;
  workerId: string;
  workerName: string;
  clientName: string;
  status: JobStatus;
  price?: number;
  category?: string;
  createdAt: Date;
  completedAt?: Date;
  contractDetails?: {
    services: string[];
    finalPrice: string;
    startDate: string;
    outcomes: Record<string, string>;
  };
}

interface Review {
  id: string;
  jobId: string;
  workerId: string;
  clientId: string;
  ratings: {
    quality: number;
    punctuality: number;
    communication: number;
    priceFairness: number;
    overall: number;
  };
  comment: string;
  createdAt: Date;
}

interface CommunityComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  isWorker: boolean;
  type: 'tip' | 'question' | 'recommendation' | 'before_after';
  content: string;
  photo?: string;
  likes: number;
  comments: CommunityComment[];
  createdAt: Date;
}

type DisputeStatus = 'pending' | 'reviewing' | 'resolved' | 'closed';

interface Dispute {
  id: string;
  jobId: string;
  clientId: string;
  workerId: string;
  reason: string;
  evidencePhoto?: string;
  status: DisputeStatus;
  createdAt: Date;
  updatedAt: Date;
}

// --- Components ---

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/10 active:bg-blue-800',
    secondary: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/10 active:bg-black',
    outline: 'border border-zinc-200 text-zinc-900 hover:bg-zinc-50 bg-white active:bg-zinc-100',
    ghost: 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200'
  };

  return (
    <button 
      className={cn(
        'px-6 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-tight',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className, ...props }: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('bg-white border border-zinc-100 rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-xl shadow-zinc-200/30', className)} {...props}>
    {children}
  </div>
);

const Input = ({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: any }) => (
  <div className="relative group">
    {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />}
    <input 
      {...props}
      className={cn(
        'w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl py-4 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500/50 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-medium',
        Icon ? 'pl-12' : 'pl-5'
      )}
    />
  </div>
);

// --- Main App ---

export default function App() {
  const [authStep, setAuthStep] = useState<AuthStep>('splash');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [activationCode, setActivationCode] = useState('');
  const [activationError, setActivationError] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [language, setLanguage] = useState<'EN' | 'AM'>('EN');
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistance, setFilterDistance] = useState(10);
  const [filterRating, setFilterRating] = useState(0);
  const [filterOnlineOnly, setFilterOnlineOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  
  // Phase 2 & 3 States
  const [categories, setCategories] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedWorkerProfile, setSelectedWorkerProfile] = useState<any | null>(null);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [estimateInput, setEstimateInput] = useState('');
  const [showEstimateInput, setShowEstimateInput] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRatings, setReviewRatings] = useState<{
    quality: number;
    punctuality: number;
    communication: number;
    priceFairness: number;
    overall: number;
  }>({
    quality: 5,
    punctuality: 5,
    communication: 5,
    priceFairness: 5,
    overall: 5
  });
  const [reviewComment, setReviewComment] = useState('');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState({ date: '', time: '', location: '' });
  const [isMeetingScheduled, setIsMeetingScheduled] = useState(false);
  const [showContractScreen, setShowContractScreen] = useState(false);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [paymentJob, setPaymentJob] = useState<Job | null>(null);
  const [contractData, setContractData] = useState({
    finalPrice: '',
    startDate: '',
    outcomes: {} as Record<string, string>,
    isSignedByWorker: false,
    isSignedByClient: false
  });
  
  const [showDisputeScreen, setShowDisputeScreen] = useState(false);
  const [disputeJob, setDisputeJob] = useState<Job | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [savedWorkerIds, setSavedWorkerIds] = useState<string[]>([]);
  const [jobFilter, setJobFilter] = useState<'all' | 'active' | 'completed' | 'disputed'>('all');
  const [earningsFilter, setEarningsFilter] = useState<'week' | 'month' | 'all'>('month');
  const [schedule, setSchedule] = useState([
    { day: 'Monday', active: true, start: '08:00', end: '18:00' },
    { day: 'Tuesday', active: true, start: '08:00', end: '18:00' },
    { day: 'Wednesday', active: true, start: '08:00', end: '18:00' },
    { day: 'Thursday', active: true, start: '08:00', end: '18:00' },
    { day: 'Friday', active: true, start: '08:00', end: '18:00' },
    { day: 'Saturday', active: false, start: '08:00', end: '18:00' },
    { day: 'Sunday', active: false, start: '08:00', end: '18:00' },
  ]);

  const earningsData = [
    { name: 'Mon', amount: 1200 },
    { name: 'Tue', amount: 1800 },
    { name: 'Wed', amount: 1500 },
    { name: 'Thu', amount: 2400 },
    { name: 'Fri', amount: 3200 },
    { name: 'Sat', amount: 2800 },
    { name: 'Sun', amount: 3500 },
  ];

  const recentPayments = [
    { id: 1, service: 'Plumbing', client: 'Abebe Bikila', date: 'Mar 22, 2026', amount: 1200, fee: 120 },
    { id: 2, service: 'Electrical', client: 'Sara Tesfaye', date: 'Mar 21, 2026', amount: 2500, fee: 250 },
    { id: 3, service: 'Painting', client: 'Dawit Lema', date: 'Mar 20, 2026', amount: 4800, fee: 480 },
    { id: 4, service: 'Cleaning', client: 'Marta Kebede', date: 'Mar 19, 2026', amount: 800, fee: 80 },
  ];
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [communityFilter, setCommunityFilter] = useState<string>('all');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<CommunityPost['type']>('tip');

  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      authorId: 'w1',
      authorName: 'Abebe Kebede',
      authorPhoto: 'https://picsum.photos/seed/abebe/200',
      isWorker: true,
      type: 'tip',
      content: 'Always check your circuit breaker before calling an electrician. Sometimes it is just a tripped switch!',
      likes: 24,
      comments: [
        { id: 'c1', authorName: 'Sara T.', content: 'Great tip, saved me money today!', createdAt: new Date() }
      ],
      createdAt: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      authorId: 'u1',
      authorName: 'Marta Hailu',
      authorPhoto: 'https://picsum.photos/seed/marta/200',
      isWorker: false,
      type: 'question',
      content: 'Can anyone recommend a good plumber in Bole area? My kitchen sink is leaking.',
      likes: 5,
      comments: [],
      createdAt: new Date(Date.now() - 7200000)
    },
    {
      id: '3',
      authorId: 'w2',
      authorName: 'Dawit Tekle',
      authorPhoto: 'https://picsum.photos/seed/dawit/200',
      isWorker: true,
      type: 'before_after',
      content: 'Just finished this bathroom renovation. What do you think?',
      photo: 'https://picsum.photos/seed/bathroom/800/600',
      likes: 45,
      comments: [
        { id: 'c2', authorName: 'John D.', content: 'Amazing work! How long did it take?', createdAt: new Date() }
      ],
      createdAt: new Date(Date.now() - 86400000)
    }
  ]);

  const socketRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         worker.skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || worker.skills?.includes(selectedCategory);
    const matchesDistance = (worker.distance / 1000) <= filterDistance;
    const matchesRating = worker.rating >= filterRating;
    const matchesOnline = !filterOnlineOnly || worker.online_status;
    
    return matchesSearch && matchesCategory && matchesDistance && matchesRating && matchesOnline;
  });

  const filteredJobs = jobs.filter(job => {
    if (jobFilter === 'all') return true;
    if (jobFilter === 'active') return job.status === 'accepted' || job.status === 'in-progress' || job.status === 'pending';
    if (jobFilter === 'completed') return job.status === 'completed';
    if (jobFilter === 'disputed') return disputes.some(d => d.jobId === job.id);
    return true;
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('skilllink_user');
    const savedAuthStep = localStorage.getItem('skilllink_authStep');
    if (savedUser && savedAuthStep === 'main') {
      setUser(JSON.parse(savedUser));
      setAuthStep('main');
    }
  }, []);

  useEffect(() => {
    if (user && authStep === 'main') {
      localStorage.setItem('skilllink_user', JSON.stringify(user));
      localStorage.setItem('skilllink_authStep', authStep);
    }
  }, [user, authStep]);

  useEffect(() => {
    if (authStep === 'splash') {
      const timer = setTimeout(() => {
        setAuthStep('onboarding');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [authStep]);

  useEffect(() => {
    fetchCategories();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchWorkers();
    }
  }, [location, selectedCategory]);

  useEffect(() => {
    if (user) {
      fetchJobs();
      socketRef.current = io();
      socketRef.current.emit('join', user.id);
      
      socketRef.current.on('receive_message', (msg: Message) => {
        setMessages(prev => [...prev, msg]);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.error('Geolocation error:', err);
          // Fallback to Dire Dawa coordinates if denied
          setLocation({ lat: 9.5917, lng: 41.8661 });
        }
      );
    }
  };

  const fetchWorkers = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const url = `/api/workers/search?lat=${location.lat}&lng=${location.lng}${selectedCategory ? `&category=${selectedCategory}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setWorkers(data);
    } catch (err) {
      console.error('Error fetching workers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/jobs/${user.id}`);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const createJob = async (worker: any, price: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: user.id,
          workerId: worker.user_id || worker.id,
          clientName: user.name || 'Client',
          workerName: worker.name,
          price: parseFloat(price),
          category: selectedCategory || (worker.skills && worker.skills[0])
        })
      });
      const newJob = await res.json();
      setJobs(prev => [newJob, ...prev]);
      return newJob;
    } catch (err) {
      console.error('Error creating job:', err);
    }
  };

  const updateJobStatus = async (jobId: string, status: JobStatus) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const updatedJob = await res.json();
      setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
      
      // Update activeJob if it's the one being modified
      if (activeJob?.id === jobId) {
        setActiveJob(updatedJob);
      }

      if (status === 'completed' && user?.role === 'client') {
        setActiveJob(updatedJob);
        setShowReviewModal(true);
      }
    } catch (err) {
      console.error('Error updating job status:', err);
    }
  };

  const toggleSaveWorker = (workerId: string) => {
    setSavedWorkerIds(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId) 
        : [...prev, workerId]
    );
  };

  const submitReview = async () => {
    if (!activeJob || !user) return;
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: activeJob.id,
          workerId: activeJob.workerId,
          clientId: user.id,
          ratings: reviewRatings,
          comment: reviewComment
        })
      });
      setShowReviewModal(false);
      setReviewComment('');
      setReviewRatings({
        quality: 5,
        punctuality: 5,
        communication: 5,
        priceFairness: 5,
        overall: 5
      });
      setActiveJob(null);
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const submitDispute = async () => {
    if (!disputeJob || !user || !disputeReason) return;
    
    const newDispute: Dispute = {
      id: `DISP-${Date.now()}`,
      jobId: disputeJob.id,
      clientId: user.id,
      workerId: disputeJob.workerId,
      reason: disputeReason,
      evidencePhoto: disputeEvidence || undefined,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setDisputes([newDispute, ...disputes]);
    setShowDisputeScreen(false);
    setDisputeReason('');
    setDisputeEvidence(null);
    setDisputeJob(null);
    alert("Dispute submitted successfully. Our admin team will review it shortly.");
  };

  const sendMessage = (isEstimate = false, amount?: string, type: 'text' | 'photo' | 'video' | 'meeting' | 'estimate' = 'text', mediaUrl?: string, meetingInfo?: any) => {
    let content = isEstimate ? `Price Estimate: ${amount} ETB` : messageInput;
    if (type === 'meeting') content = `Meeting Scheduled: ${meetingInfo.date} at ${meetingInfo.time}`;
    if (type === 'photo') content = 'Sent a photo';
    if (type === 'video') content = 'Sent a video';
    
    if ((!content.trim() && !mediaUrl) || !user || !activeChat) return;

    // Block phone numbers and links
    const phoneRegex = /(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const isBlocked = phoneRegex.test(content) || urlRegex.test(content);

    const messageData = {
      senderId: user.id,
      receiverId: activeChat.user_id || activeChat.id,
      content: isBlocked ? "Content blocked for security. Please do not share contact info before hiring." : content,
      type: isEstimate ? 'estimate' : type,
      mediaUrl,
      isEstimate,
      estimateAmount: amount,
      blocked: isBlocked,
      meetingDetails: meetingInfo,
      createdAt: new Date()
    };

    socketRef.current?.emit('send_message', messageData);
    setMessages(prev => [...prev, messageData]); // Optimistic update
    setMessageInput('');
    setEstimateInput('');
    setShowEstimateInput(false);
    if (type === 'meeting') setIsMeetingScheduled(true);
  };

  const sendMedia = (type: 'photo' | 'video') => {
    const dummyUrl = type === 'photo' 
      ? `https://picsum.photos/seed/${Math.random()}/800/600`
      : 'https://www.w3schools.com/html/mov_bbb.mp4';
    sendMessage(false, undefined, type, dummyUrl);
  };

  const t = {
    EN: {
      welcome: 'Welcome to SkillLink',
      subtitle: 'Connect with trusted professionals in Ethiopia',
      onboarding: [
        { title: 'Find Skilled Workers', desc: 'Discover verified professionals for any task, from plumbing to electrical work.' },
        { title: 'Trusted & Verified', desc: 'Every worker on SkillLink is vetted and verified for your peace of mind.' },
        { title: 'Seamless Hiring', desc: 'Chat, get estimates, and hire directly through the app with ease.' }
      ],
      skip: 'Skip',
      getStarted: 'Get Started',
      phoneLabel: 'Phone Number',
      emailLabel: 'Email Address',
      optional: '(Optional)',
      otpLabel: 'Enter the 6-digit code',
      resendOtp: 'Resend OTP',
      resendIn: 'Resend in',
      sendOtp: 'Send OTP',
      profileSetup: 'Profile Setup',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter your full name',
      uploadPhoto: 'Upload Photo',
      saveContinue: 'Save and Continue',
      languageSelection: 'Select Language',
      continue: 'Continue',
      verify: 'Verify',
      selectRole: 'Choose your role',
      client: 'I need a service',
      worker: 'I am a skilled worker',
      workerLocked: 'Worker account requires verification',
      activationLabel: 'Enter activation code from office',
      activate: 'Activate Account',
      home: 'Home',
      explore: 'Explore',
      messages: 'Messages',
      profile: 'Profile',
      trending: 'Trending Services',
      nearby: 'Nearby Workers',
      searchPlaceholder: 'Search for skills...',
      chatPlaceholder: 'Type a message...',
      estimate: 'Send Estimate',
      call: 'Call Worker',
      restricted: 'Contact info is hidden for safety',
      workerDashboard: 'Worker Dashboard',
      onlineStatus: 'Online Status',
      online: 'Online',
      offline: 'Offline',
      jobsCompleted: 'Jobs Done',
      rating: 'Rating',
      earnings: 'Earnings',
      activeLeads: 'Active Leads',
      noLeads: 'No active leads yet',
      goOnline: 'Go online to receive jobs',
      stats: 'Your Stats',
      activeJobs: 'Active Jobs',
      jobHistory: 'Job History',
      startJob: 'Start Work',
      completeJob: 'Mark as Done',
      reviewTitle: 'Rate the Service',
      reviewSubtitle: 'How was your experience with',
      submitReview: 'Submit Review',
      commentPlaceholder: 'Tell us more about the service...',
      noJobs: 'No active jobs',
      savedWorkers: 'Saved Workers',
      noSavedWorkers: 'No saved workers yet',
      myJobs: 'My Jobs',
      all: 'All',
      active: 'Active',
      completed: 'Completed',
      disputed: 'Disputed',
      noJobsFound: 'No jobs found',
      jobDetails: 'Job Details',
      community: 'Community',
      createPost: 'Create Post',
      newPost: 'New Post',
      cancel: 'Cancel',
      post: 'Post',
      safetyNotice: 'No personal information allowed',
      tips: 'Tips',
      questions: 'Questions',
      recommendations: 'Recommendations',
      beforeAfter: 'Before/After',
      like: 'Like',
      comment: 'Comment',
      share: 'Share',
      postPlaceholder: 'Share your experience or tip...',
      postType: 'Post Type',
      postSuccess: 'Post created successfully!'
    },
    AM: {
      welcome: 'እንኳን ወደ ስኪል ሊንክ በደህና መጡ',
      subtitle: 'በኢትዮጵያ ውስጥ ከታመኑ ባለሙያዎች ጋር ይገናኙ',
      onboarding: [
        { title: 'ባለሙያዎችን ያግኙ', desc: 'ለማንኛውም ስራ የተረጋገጡ ባለሙያዎችን ያግኙ።' },
        { title: 'የታመነ እና የተረጋገጠ', desc: 'በስኪል ሊንክ ላይ ያሉ ሁሉም ሰራተኞች ለደህንነትዎ የተረጋገጡ ናቸው።' },
        { title: 'ቀላል ቅጥር', desc: 'በቀጥታ በመተግበሪያው በኩል ይወያዩ እና ይቀጥሩ።' }
      ],
      skip: 'ዝለል',
      getStarted: 'ጀምር',
      phoneLabel: 'ስልክ ቁጥር',
      emailLabel: 'ኢሜል አድራሻ',
      optional: '(አማራጭ)',
      otpLabel: 'ባለ 6 አሃዝ ኮዱን ያስገቡ',
      resendOtp: 'OTP እንደገና ላክ',
      resendIn: 'እንደገና ለመላክ',
      sendOtp: 'OTP ላክ',
      profileSetup: 'መገለጫ ማስተካከያ',
      fullName: 'ሙሉ ስም',
      fullNamePlaceholder: 'ሙሉ ስምዎን ያስገቡ',
      uploadPhoto: 'ፎቶ ይጫኑ',
      saveContinue: 'አስቀምጥ እና ቀጥል',
      languageSelection: 'ቋንቋ ይምረጡ',
      continue: 'ቀጥል',
      verify: 'አረጋግጥ',
      selectRole: 'ሚናዎን ይምረጡ',
      client: 'አገልግሎት እፈልጋለሁ',
      worker: 'እኔ ባለሙያ ነኝ',
      workerLocked: 'የባለሙያ አካውንት ማረጋገጫ ያስፈልገዋል',
      activationLabel: 'ከቢሮ የተሰጠዎትን ኮድ ያስገቡ',
      activate: 'አካውንቱን አግብር',
      home: 'መነሻ',
      explore: 'ፈልግ',
      messages: 'መልዕክቶች',
      profile: 'መገለጫ',
      trending: 'ተወዳጅ አገልግሎቶች',
      nearby: 'በአቅራቢያ ያሉ ባለሙያዎች',
      searchPlaceholder: 'ባለሙያዎችን ይፈልጉ...',
      chatPlaceholder: 'መልዕክት ይጻፉ...',
      estimate: 'ዋጋ ይላኩ',
      call: 'ባለሙያውን ይደውሉ',
      restricted: 'ለደህንነት ሲባል ስልክ ቁጥር ተደብቋል',
      workerDashboard: 'የባለሙያ ዳሽቦርድ',
      onlineStatus: 'የስራ ሁኔታ',
      online: 'ክፍት',
      offline: 'ዝግ',
      jobsCompleted: 'የተሰሩ ስራዎች',
      rating: 'ደረጃ',
      earnings: 'ገቢ',
      activeLeads: 'ንቁ ስራዎች',
      noLeads: 'ምንም ንቁ ስራዎች የሉም',
      goOnline: 'ስራዎችን ለመቀበል ኦንላይን ይሁኑ',
      stats: 'የእርስዎ ስታቲስቲክስ',
      activeJobs: 'ንቁ ስራዎች',
      jobHistory: 'የስራ ታሪክ',
      startJob: 'ስራ ጀምር',
      completeJob: 'ተጠናቋል በል',
      reviewTitle: 'አገልግሎቱን ደረጃ ይስጡ',
      reviewSubtitle: 'ከዚህ ባለሙያ ጋር የነበረዎት ቆይታ እንዴት ነበር?',
      submitReview: 'አስተያየት ላክ',
      commentPlaceholder: 'ስለ አገልግሎቱ ተጨማሪ ይንገሩን...',
      noJobs: 'ምንም ንቁ ስራዎች የሉም',
      savedWorkers: 'የተቀመጡ ባለሙያዎች',
      noSavedWorkers: 'እስካሁን የተቀመጡ ባለሙያዎች የሉም',
      myJobs: 'የእኔ ስራዎች',
      all: 'ሁሉም',
      active: 'ንቁ',
      completed: 'የተጠናቀቁ',
      disputed: 'የተከራከሩ',
      noJobsFound: 'ምንም ስራዎች አልተገኙም',
      jobDetails: 'የስራ ዝርዝሮች',
      community: 'ማህበረሰብ',
      createPost: 'ልጥፍ ፍጠር',
      newPost: 'አዲስ ልጥፍ',
      cancel: 'ሰርዝ',
      post: 'ልጥፍ',
      safetyNotice: 'ምንም የግል መረጃ አይፈቀድም',
      tips: 'ጠቃሚ ምክሮች',
      questions: 'ጥያቄዎች',
      recommendations: 'ምክሮች',
      beforeAfter: 'በፊት/በኋላ',
      like: 'ውደድ',
      comment: 'አስተያየት',
      share: 'አጋራ',
      postPlaceholder: 'ልምድዎን ወይም ጠቃሚ ምክርዎን ያካፍሉ...',
      postType: 'የልጥፍ አይነት',
      postSuccess: 'ልጥፍ በተሳካ ሁኔታ ተፈጥሯል!'
    }
  }[language];

  useEffect(() => {
    let interval: any;
    if (authStep === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, resendTimer]);

  const handleSendOtp = async () => {
    if (phone.length >= 9) {
      setAuthStep('otp');
      setResendTimer(30);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length === 6) {
      setAuthStep('profile-setup');
    }
  };

  const handleProfileSave = () => {
    if (fullName.trim()) {
      setAuthStep('role-selection');
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    const newUser: UserData = { 
      id: Math.random().toString(36).substr(2, 9), 
      phone, 
      email,
      name: fullName,
      photo: profilePhoto || undefined,
      role, 
      isWorkerVerified: false 
    };
    setUser(newUser);
    if (role === 'worker') {
      setAuthStep('worker-activation');
    } else {
      setAuthStep('main');
    }
  };

  const handleActivate = () => {
    if (activationCode.toUpperCase() === 'DIRE2026') {
      setUser(prev => prev ? { ...prev, isWorkerVerified: true } : null);
      setAuthStep('main');
      setActivationError(false);
    } else {
      setActivationError(true);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setAuthStep('onboarding');
    setPhone('');
    setEmail('');
    setFullName('');
    setProfilePhoto(null);
    setOtp('');
    setActiveTab('home');
    setShowSidebar(false);
  };

  // --- Auth Screens ---

  if (authStep === 'splash') {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ 
            scale: [0.8, 1.1, 1],
            opacity: 1,
            rotate: 0
          }}
          transition={{ 
            duration: 1.2, 
            ease: [0.16, 1, 0.3, 1],
            times: [0, 0.6, 1]
          }}
          className="relative flex flex-col items-center space-y-8"
        >
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 0 0px rgba(37, 99, 235, 0)", "0 0 0 20px rgba(37, 99, 235, 0.1)", "0 0 0 40px rgba(37, 99, 235, 0)"]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-28 h-28 bg-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-600/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
            <ShieldCheck className="w-14 h-14 text-white relative z-10" />
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center space-y-2"
          >
            <h1 className="text-5xl font-black tracking-tighter text-zinc-900">
              SKILL<span className="text-blue-600">LINK</span>
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-zinc-200" />
              <p className="text-zinc-400 font-bold tracking-[0.3em] text-[10px] uppercase">
                Service Hub Ethiopia
              </p>
              <div className="h-[1px] w-8 bg-zinc-200" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (authStep === 'onboarding') {
    const slide = t.onboarding[onboardingIndex];
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col p-8 font-sans relative overflow-hidden">
        <div className="flex justify-between items-center mb-12">
          <div className="flex gap-1.5">
            {t.onboarding.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === onboardingIndex ? "w-10 bg-blue-600" : "w-2 bg-zinc-100"
                )}
              />
            ))}
          </div>
          <button 
            onClick={() => setAuthStep('phone')}
            className="text-zinc-400 text-xs font-black uppercase tracking-widest hover:text-zinc-900 transition-colors"
          >
            {t.skip}
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={onboardingIndex}
              initial={{ x: 40, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -40, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10 w-full"
            >
              <div className="w-72 h-72 bg-slate-50 rounded-[48px] flex items-center justify-center mx-auto relative group">
                <div className="absolute inset-0 bg-blue-600/5 rounded-[48px] scale-110 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  {onboardingIndex === 0 && <Search className="w-28 h-28 text-blue-600" />}
                  {onboardingIndex === 1 && <ShieldCheck className="w-28 h-28 text-blue-600" />}
                  {onboardingIndex === 2 && <MessageSquare className="w-28 h-28 text-blue-600" />}
                </div>
              </div>
              <div className="space-y-4 px-4">
                <h2 className="text-4xl font-black tracking-tight leading-tight">{slide.title}</h2>
                <p className="text-zinc-500 text-lg leading-relaxed max-w-xs mx-auto font-medium">
                  {slide.desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pb-8">
          <Button 
            className="w-full h-16 text-lg rounded-3xl" 
            onClick={() => {
              if (onboardingIndex < t.onboarding.length - 1) {
                setOnboardingIndex(onboardingIndex + 1);
              } else {
                setAuthStep('phone');
              }
            }}
          >
            {onboardingIndex === t.onboarding.length - 1 ? t.getStarted : t.continue}
            <ChevronRight className="w-6 h-6 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (authStep !== 'main') {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col p-8 font-sans">
        <div className="flex justify-between items-center mb-12">
          {authStep !== 'phone' ? (
            <button 
              onClick={() => {
                if (authStep === 'otp') setAuthStep('phone');
                if (authStep === 'profile-setup') setAuthStep('otp');
                if (authStep === 'role-selection') setAuthStep('profile-setup');
                if (authStep === 'worker-activation') setAuthStep('role-selection');
              }}
              className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-200 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : <div />}
          
          <button 
            onClick={() => setLanguage(language === 'EN' ? 'AM' : 'EN')}
            className="text-[10px] font-black tracking-widest uppercase border border-zinc-100 px-5 py-2.5 rounded-full text-blue-600 bg-white shadow-sm hover:bg-zinc-50 transition-colors"
          >
            {language === 'EN' ? 'አማርኛ' : 'English'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {authStep === 'phone' && (
            <motion.div 
              key="phone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col max-w-md mx-auto w-full"
            >
              <div className="mb-12">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-black mb-3 tracking-tight">{t.welcome}</h1>
                <p className="text-zinc-500 text-lg font-medium">{t.subtitle}</p>
              </div>

              <Card className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                      {t.phoneLabel} <span className="text-blue-600">*</span>
                    </label>
                    <Input 
                      icon={Phone} 
                      placeholder="+251 9..." 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">
                      {t.emailLabel} <span className="text-zinc-300 font-bold italic lowercase">{t.optional}</span>
                    </label>
                    <Input 
                      icon={Mail} 
                      placeholder="example@mail.com" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <Button className="w-full h-16 text-lg" onClick={handleSendOtp} disabled={phone.length < 9}>
                  {t.sendOtp} <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            </motion.div>
          )}

          {authStep === 'otp' && (
            <motion.div 
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col max-w-md mx-auto w-full"
            >
              <div className="mb-12">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-black mb-3 tracking-tight">{t.verify}</h1>
                <p className="text-zinc-500 text-lg font-medium">
                  {t.otpLabel} <span className="text-zinc-900 font-black">{phone}</span>
                </p>
              </div>

              <Card className="space-y-10">
                <div className="space-y-6">
                  <Input 
                    placeholder="0 0 0 0 0 0" 
                    className="text-center text-4xl tracking-[0.4em] font-black h-24 bg-zinc-50/50 border-zinc-100 focus:border-blue-500/50"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  
                  <div className="flex justify-center">
                    {resendTimer > 0 ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full border border-zinc-100">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">
                          {t.resendIn} <span className="text-blue-600">0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</span>
                        </p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setResendTimer(30);
                          setOtp('');
                        }}
                        className="text-xs text-blue-600 font-black uppercase tracking-widest hover:underline"
                      >
                        {t.resendOtp}
                      </button>
                    )}
                  </div>
                </div>

                <Button 
                  className="w-full h-16 text-lg" 
                  onClick={handleVerifyOtp} 
                  disabled={otp.length !== 6}
                >
                  {t.verify}
                </Button>
              </Card>
            </motion.div>
          )}

          {authStep === 'profile-setup' && (
            <motion.div 
              key="profile-setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col max-w-md mx-auto w-full"
            >
              <div className="mb-12">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-black mb-3 tracking-tight">{t.profileSetup}</h1>
                <p className="text-zinc-500 text-lg font-medium">Let's personalize your experience</p>
              </div>

              <Card className="space-y-10">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[40px] bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-500/50">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-10 h-10 text-zinc-300 group-hover:text-blue-500 transition-colors" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 border-4 border-white">
                      <Plus className="w-6 h-6 text-white" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setProfilePhoto(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">{t.uploadPhoto}</span>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2.5">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">{t.fullName}</label>
                    <Input 
                      icon={User} 
                      placeholder={t.fullNamePlaceholder}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <Button className="w-full h-16 text-lg" onClick={handleProfileSave} disabled={!fullName.trim()}>
                    {t.saveContinue} <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
          {authStep === 'role-selection' && (
            <motion.div 
              key="role-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col max-w-md mx-auto w-full"
            >
              <div className="mb-12">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-black mb-3 tracking-tight">{t.selectRole}</h1>
                <p className="text-zinc-500 text-lg font-medium">How will you use SkillLink?</p>
              </div>

              <div className="grid gap-6">
                <button 
                  onClick={() => handleRoleSelect('client')}
                  className="group relative flex flex-col items-center p-8 bg-white border border-zinc-100 rounded-[32px] shadow-xl shadow-zinc-200/30 hover:border-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-500">
                    <User className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-xl font-black mb-2">{t.client}</h3>
                  <p className="text-zinc-400 text-sm font-medium text-center">Hire professionals for your home or business</p>
                </button>

                <button 
                  onClick={() => handleRoleSelect('worker')}
                  className="group relative flex flex-col items-center p-8 bg-white border border-zinc-100 rounded-[32px] shadow-xl shadow-zinc-200/30 hover:border-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-500">
                    <HardHat className="w-10 h-10 text-zinc-400 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-xl font-black mb-2">{t.worker}</h3>
                  <p className="text-zinc-400 text-sm font-medium text-center">Offer your skills and grow your business</p>
                </button>
              </div>
            </motion.div>
          )}

          {authStep === 'worker-activation' && (
            <motion.div 
              key="worker-activation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col max-w-md mx-auto w-full"
            >
              <div className="mb-12">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-black mb-3 tracking-tight">{t.activate}</h1>
                <p className="text-zinc-500 text-lg font-medium">{t.workerLocked}</p>
              </div>

              <Card className="space-y-10">
                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">{t.activationLabel}</label>
                    <Input 
                      placeholder="DIRE-XXXX-XXXX"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      className={cn(activationError && "border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/5")}
                    />
                    {activationError && (
                      <div className="flex items-center gap-2 text-red-500 mt-2 px-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-bold">Invalid activation code. Please contact support.</span>
                      </div>
                    )}
                  </div>

                  <Button className="w-full h-16 text-lg" onClick={handleActivate}>
                    {t.activate}
                  </Button>
                </div>

                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <p className="text-xs text-blue-600 font-bold leading-relaxed text-center">
                    Visit our office in Dire Dawa to get your activation code and complete verification.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- Main App Interface ---

  if (showDisputeScreen && disputeJob) {
    const job = disputeJob;
    const existingDispute = disputes.find(d => d.jobId === job.id);

    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans max-w-md mx-auto relative shadow-2xl shadow-zinc-200/50">
        <header className="p-4 flex items-center justify-between sticky top-0 bg-zinc-50/80 backdrop-blur-xl z-50 border-b border-zinc-100 w-full">
          <button 
            onClick={() => setShowDisputeScreen(false)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-900" />
          </button>
          <h2 className="font-black uppercase tracking-widest text-[10px] text-zinc-400">Dispute Center</h2>
          <div className="w-12" />
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight">
              {existingDispute ? 'Dispute Status' : 'Open a Dispute'}
            </h3>
            <p className="text-zinc-500 text-sm font-medium">
              {existingDispute 
                ? 'Track the progress of your active dispute.' 
                : `Tell us what went wrong with ${job.workerName}'s work.`}
            </p>
          </div>

          {existingDispute ? (
            <div className="space-y-8">
              {/* Status Tracker */}
              <section className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  {(['pending', 'reviewing', 'resolved'] as DisputeStatus[]).map((status, i) => {
                    const statuses = ['pending', 'reviewing', 'resolved'];
                    const currentStep = statuses.indexOf(existingDispute.status);
                    return (
                      <div key={status} className="flex flex-col items-center gap-2 relative flex-1">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500",
                          i <= currentStep ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-zinc-200 text-zinc-400"
                        )}>
                          {i < currentStep ? <CheckCircle className="w-5 h-5" /> : <span className="text-[10px] font-black">{i + 1}</span>}
                        </div>
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest text-center",
                          i <= currentStep ? "text-red-600" : "text-zinc-400"
                        )}>
                          {status}
                        </span>
                        {i < 2 && (
                          <div className={cn(
                            "absolute top-4 left-[60%] w-[80%] h-[2px] -z-0",
                            i < currentStep ? "bg-red-600" : "bg-zinc-200"
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <Card className="bg-red-50 border-red-100 p-6 rounded-[32px]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Current Status</p>
                      <h4 className="text-lg font-black text-zinc-900 capitalize">{existingDispute.status}</h4>
                      <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                        {existingDispute.status === 'pending' && "Our team has received your dispute and will assign an agent shortly."}
                        {existingDispute.status === 'reviewing' && "An admin is currently reviewing the evidence provided by both parties."}
                        {existingDispute.status === 'resolved' && "This dispute has been resolved. Check your email for details."}
                      </p>
                    </div>
                  </div>
                </Card>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Your Submission</h4>
                <Card className="bg-white border-zinc-100 p-6 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Reason</p>
                    <p className="text-sm font-medium text-zinc-900">{existingDispute.reason}</p>
                  </div>
                  {existingDispute.evidencePhoto && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Evidence</p>
                      <div className="w-full aspect-video rounded-2xl overflow-hidden border border-zinc-100">
                        <img src={existingDispute.evidencePhoto} alt="Evidence" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </Card>
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Reason Input */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Reason for Dispute</h4>
                <textarea 
                  placeholder="Describe the issue in detail..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-white border border-zinc-100 rounded-[32px] p-6 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-red-500/50 transition-all min-h-[160px] resize-none text-sm font-medium shadow-sm"
                />
              </section>

              {/* Evidence Upload */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Evidence Photo</h4>
                {disputeEvidence ? (
                  <div className="relative w-full aspect-video rounded-[32px] overflow-hidden border-2 border-red-500 shadow-xl">
                    <img src={disputeEvidence} alt="Evidence" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setDisputeEvidence(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <X className="w-5 h-5 text-zinc-900" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setDisputeEvidence('https://picsum.photos/seed/evidence/800/450')}
                    className="w-full aspect-video bg-white border-2 border-dashed border-zinc-200 rounded-[32px] flex flex-col items-center justify-center gap-3 hover:border-red-500/50 hover:bg-red-50/30 transition-all group"
                  >
                    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <Camera className="w-8 h-8 text-zinc-400 group-hover:text-red-600" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-red-600">Upload Evidence Photo</p>
                  </button>
                )}
              </section>

              <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 flex gap-4">
                <Info className="w-6 h-6 text-amber-600 shrink-0" />
                <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                  Our admin team will review your dispute within 24-48 hours. Please provide as much detail as possible to speed up the process.
                </p>
              </div>
            </div>
          )}
        </div>

        {!existingDispute && (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-zinc-50/80 backdrop-blur-xl border-t border-zinc-100 z-50 max-w-md mx-auto">
            <Button 
              disabled={!disputeReason}
              className="w-full h-16 rounded-3xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-red-600/20 bg-red-600 hover:bg-red-700"
              onClick={submitDispute}
            >
              <ShieldAlert className="w-6 h-6" />
              Submit to Admin
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (showPaymentScreen && paymentJob) {
    const job = paymentJob;
    const total = job.price || 0;
    const platformFee = total * 0.03;
    const workerAmount = total * 0.97;

    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans max-w-md mx-auto relative shadow-2xl shadow-zinc-200/50">
        <header className="p-4 flex items-center justify-between sticky top-0 bg-zinc-50/80 backdrop-blur-xl z-50 border-b border-zinc-100 w-full">
          <button 
            onClick={() => setShowPaymentScreen(false)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-900" />
          </button>
          <h2 className="font-black uppercase tracking-widest text-[10px] text-zinc-400">Secure Payment</h2>
          <div className="w-12" />
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight">Complete Payment</h3>
            <p className="text-zinc-500 text-sm font-medium">Securely pay {job.workerName} for the completed job.</p>
          </div>

          {/* Job Summary */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Job Summary</h4>
            <Card className="bg-white border-zinc-100 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-zinc-900">{job.category}</h4>
                  <p className="text-xs text-zinc-500 font-medium">Worker: {job.workerName}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Completed
                </span>
              </div>
              <div className="pt-4 border-t border-zinc-50 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Amount</span>
                <span className="text-xl font-black text-zinc-900">{total.toLocaleString()} ETB</span>
              </div>
            </Card>
          </section>

          {/* Amount Breakdown */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Price Breakdown</h4>
            <Card className="bg-white border-zinc-100 p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 font-medium">Worker Payment (97%)</span>
                <span className="font-black text-zinc-900">{workerAmount.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 font-medium">Platform Fee (3%)</span>
                <span className="font-black text-zinc-900">{platformFee.toLocaleString()} ETB</span>
              </div>
              <div className="pt-4 border-t border-zinc-50 flex justify-between items-center">
                <span className="font-black text-zinc-900">Total Charged</span>
                <span className="font-black text-blue-600">{total.toLocaleString()} ETB</span>
              </div>
            </Card>
          </section>

          {/* Payment Method */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Payment Method</h4>
            <div className="grid gap-3">
              <button className="flex items-center justify-between p-6 bg-white border-2 border-blue-600 rounded-[32px] shadow-xl shadow-blue-600/5 transition-all scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-zinc-900">Chapa</p>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Local Payment Gateway</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border-4 border-blue-600 bg-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                </div>
              </button>
              
              <button disabled className="flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-[32px] opacity-50 grayscale cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-zinc-400">Telebirr</p>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Coming Soon</p>
                  </div>
                </div>
              </button>
            </div>
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-zinc-50/80 backdrop-blur-xl border-t border-zinc-100 z-50 max-w-md mx-auto">
          <Button 
            className="w-full h-16 rounded-3xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
            onClick={() => {
              // Simulate Chapa redirect/payment
              setTimeout(() => {
                setShowPaymentScreen(false);
                setActiveJob(null);
                setActiveTab('home');
              }, 2000);
            }}
          >
            <Receipt className="w-6 h-6" />
            Pay {total.toLocaleString()} ETB Now
          </Button>
        </div>
      </div>
    );
  }

  if (activeJob && !showReviewModal) {
    const job = activeJob;
    const statuses: JobStatus[] = ['pending', 'accepted', 'in-progress', 'completed'];
    const currentStep = statuses.indexOf(job.status);

    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans max-w-md mx-auto relative shadow-2xl shadow-zinc-200/50">
        <header className="p-4 flex items-center justify-between sticky top-0 bg-zinc-50/80 backdrop-blur-xl z-50 border-b border-zinc-100 w-full">
          <button 
            onClick={() => setActiveJob(null)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-900" />
          </button>
          <h2 className="font-black uppercase tracking-widest text-[10px] text-zinc-400">Job Status</h2>
          <button 
            onClick={() => {
              setActiveChat({ id: job.workerId, name: job.workerName });
              setActiveJob(null);
            }}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100"
          >
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
          {/* Status Tracker */}
          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
              {statuses.map((status, i) => (
                <div key={status} className="flex flex-col items-center gap-2 relative flex-1">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500",
                    i <= currentStep ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-zinc-200 text-zinc-400"
                  )}>
                    {i < currentStep ? <CheckCircle className="w-5 h-5" /> : <span className="text-[10px] font-black">{i + 1}</span>}
                  </div>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest text-center",
                    i <= currentStep ? "text-blue-600" : "text-zinc-400"
                  )}>
                    {status.replace('-', ' ')}
                  </span>
                  {i < statuses.length - 1 && (
                    <div className={cn(
                      "absolute top-4 left-[60%] w-[80%] h-[2px] -z-0",
                      i < currentStep ? "bg-blue-600" : "bg-zinc-200"
                    )} />
                  )}
                </div>
              ))}
            </div>

            <Card className="bg-blue-600 text-white p-6 rounded-[32px] shadow-xl shadow-blue-600/20">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Current Phase</p>
                  <h3 className="text-2xl font-black capitalize tracking-tight">{job.status.replace('-', ' ')}</h3>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium opacity-80 leading-relaxed">
                {job.status === 'pending' && "Waiting for the worker to accept the job request."}
                {job.status === 'accepted' && "Worker has accepted. They will start the job soon."}
                {job.status === 'in-progress' && "Job is currently being executed. Stay in touch via chat."}
                {job.status === 'completed' && "Job has been marked as finished. Please confirm completion."}
              </p>
            </Card>
          </section>

          {/* Contract Summary */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Contract Summary</h4>
            <Card className="bg-white border-zinc-100 p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Final Price</p>
                  <p className="text-xl font-black text-zinc-900">{job.price} ETB</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Start Date</p>
                  <p className="text-sm font-black text-zinc-900">{job.contractDetails?.startDate || 'Not set'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Services & Outcomes</p>
                {job.contractDetails?.services.map(service => (
                  <div key={service} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{service}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium italic">
                      {job.contractDetails?.outcomes[service] || 'No specific outcome defined'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Dispute Button */}
          <button 
            onClick={() => {
              setDisputeJob(job);
              setShowDisputeScreen(true);
            }}
            className="w-full py-4 flex items-center justify-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            Mark a Dispute
          </button>
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-zinc-50/80 backdrop-blur-xl border-t border-zinc-100 z-50 max-w-md mx-auto">
          {job.status === 'completed' ? (
            <Button 
              className="w-full h-16 rounded-3xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setPaymentJob(job);
                setShowPaymentScreen(true);
              }}
            >
              <CreditCard className="w-6 h-6" />
              Proceed to Payment
            </Button>
          ) : (
            <div className="flex gap-3">
              {user?.role === 'worker' && job.status === 'accepted' && (
                <Button 
                  className="flex-1 h-16 rounded-3xl text-sm font-black uppercase tracking-widest"
                  onClick={() => updateJobStatus(job.id, 'in-progress')}
                >
                  Start Work
                </Button>
              )}
              {user?.role === 'worker' && job.status === 'in-progress' && (
                <Button 
                  className="flex-1 h-16 rounded-3xl text-sm font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => updateJobStatus(job.id, 'completed')}
                >
                  Mark Finished
                </Button>
              )}
              {user?.role === 'client' && job.status === 'pending' && (
                <p className="w-full text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest py-4">
                  Waiting for worker to accept...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showContractScreen && activeChat) {
    const worker = activeChat;
    const lastEstimate = messages.filter(m => m.isEstimate).pop();
    const estimatedPrice = lastEstimate?.estimateAmount || '0';

    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans max-w-md mx-auto relative shadow-2xl shadow-zinc-200/50">
        <header className="p-4 flex items-center justify-between sticky top-0 bg-zinc-50/80 backdrop-blur-xl z-50 border-b border-zinc-100 w-full">
          <button 
            onClick={() => setShowContractScreen(false)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-900" />
          </button>
          <h2 className="font-black uppercase tracking-widest text-[10px] text-zinc-400">Service Contract</h2>
          <div className="w-12" />
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight">Finalize Agreement</h3>
            <p className="text-zinc-500 text-sm font-medium">Review and sign the service contract with {worker.name}.</p>
          </div>

          {/* Services Section */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Included Services</h4>
            <div className="space-y-3">
              {selectedServices.map(service => (
                <Card key={service} className="bg-white border-zinc-100 p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-black uppercase tracking-widest text-[10px]">{service}</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1">Expected Outcome</label>
                    <Input 
                      placeholder="e.g. Fix leak and replace pipe" 
                      value={contractData.outcomes[service] || ''}
                      onChange={(e) => setContractData({
                        ...contractData,
                        outcomes: { ...contractData.outcomes, [service]: e.target.value }
                      })}
                      className="h-10 text-xs"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Pricing Section */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Pricing & Timeline</h4>
            <Card className="bg-white border-zinc-100 p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-50">
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Estimated Price</p>
                  <p className="text-lg font-black text-zinc-900">{estimatedPrice} ETB</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Final Agreed Price</p>
                  <div className="flex items-center gap-2 justify-end">
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={contractData.finalPrice}
                      onChange={(e) => setContractData({ ...contractData, finalPrice: e.target.value })}
                      className="w-24 h-10 text-right font-black"
                    />
                    <span className="text-xs font-black">ETB</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    type="date"
                    value={contractData.startDate}
                    onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
                    className="pl-12"
                  />
                </div>
              </div>
            </Card>
          </section>

          {/* Signature Status */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Signature Status</h4>
            <div className="grid grid-cols-2 gap-4">
              <Card className={cn(
                "p-4 flex flex-col items-center gap-3 border-2 transition-all",
                contractData.isSignedByClient ? "bg-emerald-50 border-emerald-500/30" : "bg-white border-zinc-100"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  contractData.isSignedByClient ? "bg-emerald-500 text-white" : "bg-zinc-50 text-zinc-400"
                )}>
                  {contractData.isSignedByClient ? <CheckCircle2 className="w-6 h-6" /> : <Fingerprint className="w-6 h-6" />}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">You</p>
              </Card>
              <Card className={cn(
                "p-4 flex flex-col items-center gap-3 border-2 transition-all",
                contractData.isSignedByWorker ? "bg-emerald-50 border-emerald-500/30" : "bg-white border-zinc-100"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  contractData.isSignedByWorker ? "bg-emerald-500 text-white" : "bg-zinc-50 text-zinc-400"
                )}>
                  {contractData.isSignedByWorker ? <CheckCircle2 className="w-6 h-6" /> : <Fingerprint className="w-6 h-6" />}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">{worker.name.split(' ')[0]}</p>
              </Card>
            </div>
            {!contractData.isSignedByWorker && contractData.isSignedByClient && (
              <div className="flex items-center gap-2 justify-center p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Waiting for worker to sign...</p>
              </div>
            )}
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-zinc-50/80 backdrop-blur-xl border-t border-zinc-100 z-50 max-w-md mx-auto">
          <Button 
            disabled={contractData.isSignedByClient || !contractData.finalPrice || !contractData.startDate}
            className="w-full h-16 rounded-3xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
            onClick={async () => {
              // Simulate biometric sign
              setContractData({ ...contractData, isSignedByClient: true });
              
              // Create the actual job with contract details
              const newJob = await createJob(activeChat, contractData.finalPrice);
              if (newJob) {
                const jobWithContract = {
                  ...newJob,
                  contractDetails: {
                    services: selectedServices,
                    finalPrice: contractData.finalPrice,
                    startDate: contractData.startDate,
                    outcomes: contractData.outcomes
                  }
                };
                setJobs(prev => prev.map(j => j.id === newJob.id ? jobWithContract : j));
                
                // Simulate worker signing and accepting
                setTimeout(() => {
                  setContractData(prev => ({ ...prev, isSignedByWorker: true }));
                  updateJobStatus(newJob.id, 'accepted');
                  setActiveJob(jobWithContract);
                  setShowContractScreen(false);
                }, 3000);
              }
            }}
          >
            <Fingerprint className="w-6 h-6" />
            {contractData.isSignedByClient ? 'Signed with Biometrics' : 'Sign Contract'}
          </Button>
        </div>
      </div>
    );
  }

  if (showServiceSelection && selectedWorkerProfile) {
    const worker = selectedWorkerProfile;
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans max-w-md mx-auto relative shadow-2xl shadow-zinc-200/50">
        <header className="p-4 flex items-center justify-between sticky top-0 bg-zinc-50/80 backdrop-blur-xl z-50 border-b border-zinc-100 w-full">
          <button 
            onClick={() => setShowServiceSelection(false)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-900" />
          </button>
          <h2 className="font-black uppercase tracking-widest text-[10px] text-zinc-400">Select Services</h2>
          <div className="w-12" />
        </header>

        <div className="flex-1 p-6 space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight">What do you need?</h3>
            <p className="text-zinc-500 text-sm font-medium">Select one or more services from {worker.name.split(' ')[0]}'s verified skills.</p>
          </div>

          <div className="grid gap-4">
            {worker.skills?.map((skill: string) => (
              <button
                key={skill}
                onClick={() => {
                  setSelectedServices(prev => 
                    prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                  );
                }}
                className={cn(
                  "flex items-center justify-between p-6 rounded-[32px] border-2 transition-all",
                  selectedServices.includes(skill) 
                    ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.02]" 
                    : "bg-white border-zinc-100 text-zinc-900 hover:border-zinc-200"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    selectedServices.includes(skill) ? "bg-white/20" : "bg-zinc-50"
                  )}>
                    <ShieldCheck className={cn("w-6 h-6", selectedServices.includes(skill) ? "text-white" : "text-blue-600")} />
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs">{skill}</span>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  selectedServices.includes(skill) ? "bg-white border-white" : "border-zinc-200"
                )}>
                  {selectedServices.includes(skill) && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-zinc-50/80 backdrop-blur-xl border-t border-zinc-100">
          <Button 
            disabled={selectedServices.length === 0}
            className="w-full h-16 rounded-3xl text-sm font-black uppercase tracking-widest disabled:opacity-50 disabled:grayscale"
            onClick={() => {
              setActiveChat(worker);
              setShowServiceSelection(false);
              setSelectedWorkerProfile(null);
              setMessages([{
                senderId: user?.id || '',
                receiverId: worker.user_id || worker.id,
                content: `I am interested in: ${selectedServices.join(', ')}`,
                createdAt: new Date()
              }]);
            }}
          >
            Confirm & Message
          </Button>
        </div>
      </div>
    );
  }

  if (selectedWorkerProfile) {
    const worker = selectedWorkerProfile;
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans max-w-md mx-auto relative shadow-2xl shadow-zinc-200/50">
        {/* Header */}
        <header className="p-4 flex items-center justify-between sticky top-0 bg-zinc-50/80 backdrop-blur-xl z-50 border-b border-zinc-100 w-full">
          <button 
            onClick={() => setSelectedWorkerProfile(null)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-900" />
          </button>
          <h2 className="font-black uppercase tracking-widest text-[10px] text-zinc-400">Worker Profile</h2>
          <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100">
            <Flag className="w-5 h-5 text-red-500" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto pb-32">
          {/* Profile Hero */}
          <div className="p-6 flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-40 h-40 rounded-[56px] bg-white p-1.5 shadow-2xl shadow-zinc-200/50">
                <div className="w-full h-full rounded-[50px] bg-zinc-100 overflow-hidden border border-zinc-100">
                  <img src={`https://picsum.photos/seed/${worker.name}/400`} alt={worker.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className={cn(
                "absolute bottom-2 right-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-4 border-zinc-50 shadow-lg",
                worker.online_status ? "bg-emerald-500 text-white" : "bg-zinc-300 text-zinc-600"
              )}>
                {worker.online_status ? 'Online' : 'Offline'}
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">{worker.name}</h2>
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {worker.skills?.map((skill: string) => (
                  <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-6 grid grid-cols-2 gap-4">
            <Card className="bg-white border-zinc-100 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Rating</p>
                <p className="text-lg font-black text-zinc-900">{Number(worker.rating).toFixed(1)}</p>
              </div>
            </Card>
            <Card className="bg-white border-zinc-100 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Jobs</p>
                <p className="text-lg font-black text-zinc-900">{worker.jobs_completed || 0}</p>
              </div>
            </Card>
            <Card className="bg-white border-zinc-100 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Response</p>
                <p className="text-lg font-black text-zinc-900">15 min</p>
              </div>
            </Card>
            <Card className="bg-white border-zinc-100 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Success</p>
                <p className="text-lg font-black text-zinc-900">98%</p>
              </div>
            </Card>
          </div>

          {/* Availability */}
          <section className="p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Availability</h3>
            <Card className="bg-white border-zinc-100 p-6">
              <div className="grid grid-cols-7 gap-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-400">{day}</span>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black",
                      i < 5 ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-400"
                    )}>
                      {i < 5 ? '8-6' : '-'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Reviews */}
          <section className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Reviews</h3>
              <span className="text-xs font-black text-blue-600">See All</span>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Abebe K.', ratings: { overall: 5 }, comment: 'Excellent work! Very professional and arrived on time.', date: '2 days ago' },
                { name: 'Selam T.', ratings: { overall: 4 }, comment: 'Good service, fixed the issue quickly.', date: '1 week ago' }
              ].map((rev: any, i) => (
                <Card key={i} className="bg-white border-zinc-100 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black">
                        {rev.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-zinc-900">{rev.name}</h4>
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{rev.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, star) => (
                        <Star key={star} className={cn("w-2.5 h-2.5", star < (rev.rating || rev.ratings?.overall || 0) ? "text-amber-500 fill-amber-500" : "text-zinc-200")} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-medium">{rev.comment}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-zinc-50/80 backdrop-blur-xl border-t border-zinc-100 z-50 max-w-md mx-auto">
          <Button 
            className="w-full h-16 rounded-3xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3"
            onClick={() => {
              setShowServiceSelection(true);
              setSelectedServices([]);
            }}
          >
            <MessageSquare className="w-5 h-5" />
            Message {worker.name.split(' ')[0]}
          </Button>
        </div>
      </div>
    );
  }

  if (activeChat) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans max-w-md mx-auto relative shadow-2xl shadow-zinc-200/50">
        {/* Chat Header */}
        <header className="p-4 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-zinc-100 w-full">
          <button onClick={() => { setActiveChat(null); setMessages([]); setIsMeetingScheduled(false); }} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-zinc-600" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
              <img src={`https://picsum.photos/seed/${activeChat.name}/200`} alt={activeChat.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 leading-none text-sm">{activeChat.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">Online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-zinc-50 text-zinc-600 rounded-xl hover:bg-zinc-100 transition-all border border-zinc-100">
              <MoreVertical className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all">
              <Phone className="w-4 h-4" /> {t.call}
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 mb-6">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 font-bold leading-relaxed">
              {t.restricted}
            </p>
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={cn("flex flex-col", msg.senderId === user?.id ? "items-end" : "items-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl text-sm font-medium shadow-sm overflow-hidden",
                msg.senderId === user?.id 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-white border border-zinc-100 text-zinc-800 rounded-tl-none",
                msg.blocked && "bg-red-50 border-red-100 text-red-600 italic"
              )}>
                {msg.type === 'photo' && (
                  <div className="p-1">
                    <img src={msg.mediaUrl} alt="Sent photo" className="rounded-xl w-full max-h-60 object-cover" />
                  </div>
                )}
                {msg.type === 'video' && (
                  <div className="p-1 relative group">
                    <video src={msg.mediaUrl} className="rounded-xl w-full max-h-60 object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                {msg.type === 'meeting' && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/20">
                      <Calendar className="w-4 h-4" />
                      <span className="font-black uppercase tracking-widest text-[10px]">Meeting Scheduled</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold">{msg.meetingDetails?.date}</p>
                      <p className="text-[10px] opacity-80">{msg.meetingDetails?.time} • {msg.meetingDetails?.location}</p>
                    </div>
                  </div>
                )}
                {msg.isEstimate && (
                  <div className="p-4 space-y-3">
                    <div className={cn(
                      "flex items-center gap-2 pb-2 border-b",
                      msg.senderId === user?.id ? "border-white/20" : "border-zinc-100"
                    )}>
                      <DollarSign className="w-4 h-4" />
                      <span className="font-black uppercase tracking-widest text-[10px]">Price Estimate</span>
                    </div>
                    <div className="text-lg font-black">{msg.estimateAmount} ETB</div>
                    {user?.role === 'client' && msg.senderId !== user.id && (
                      <button 
                        className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm"
                        onClick={async () => {
                          const job = await createJob(activeChat, msg.estimateAmount || '0');
                          if (job) {
                            setActiveJob(job);
                            sendMessage(false, undefined, 'text', undefined, undefined);
                            socketRef.current?.emit('send_message', {
                              senderId: user.id,
                              receiverId: activeChat.user_id || activeChat.id,
                              content: `I accept the estimate of ${msg.estimateAmount} ETB. Job #${job.id} has been created.`,
                              createdAt: new Date()
                            });
                          }
                        }}
                      >
                        Accept Estimate & Start Job
                      </button>
                    )}
                  </div>
                )}
                {!msg.isEstimate && msg.type !== 'photo' && msg.type !== 'video' && msg.type !== 'meeting' && (
                  <div className="p-4 flex items-start gap-2">
                    {msg.blocked && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    {msg.content}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 font-black uppercase tracking-widest px-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-white/50 backdrop-blur-sm border-t border-zinc-100">
          {user?.role === 'worker' && !isMeetingScheduled && (
            <button 
              onClick={() => setShowMeetingModal(true)}
              className="flex-shrink-0 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" /> Schedule Meeting
            </button>
          )}
          {isMeetingScheduled && (
            <button 
              onClick={() => setShowContractScreen(true)}
              className="flex-shrink-0 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" /> Create Contract
            </button>
          )}
          <button className="flex-shrink-0 px-4 py-2 bg-zinc-50 text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-100 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> Safety Tips
          </button>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white space-y-4">
          {user?.role === 'worker' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button 
                  onClick={() => sendMessage(true, "500")}
                  className="flex-1 py-2.5 bg-zinc-50 text-zinc-600 border border-zinc-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all"
                >
                  500 ETB
                </button>
                <button 
                  onClick={() => sendMessage(true, "1000")}
                  className="flex-1 py-2.5 bg-zinc-50 text-zinc-600 border border-zinc-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all"
                >
                  1000 ETB
                </button>
                <button 
                  onClick={() => setShowEstimateInput(!showEstimateInput)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    showEstimateInput ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/10" : "bg-white text-zinc-500 border-zinc-100"
                  )}
                >
                  Custom
                </button>
              </div>
              
              <AnimatePresence>
                {showEstimateInput && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter amount..." 
                        value={estimateInput}
                        onChange={(e) => setEstimateInput(e.target.value)}
                        className="h-12"
                      />
                      <Button 
                        className="h-12 px-4 text-xs uppercase tracking-widest font-black"
                        onClick={() => sendMessage(true, estimateInput)}
                      >
                        Send
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <div className="flex gap-1">
              <button 
                onClick={() => sendMedia('photo')}
                className="p-3 bg-zinc-50 text-zinc-400 rounded-2xl hover:bg-zinc-100 transition-all border border-zinc-100"
              >
                <Image className="w-5 h-5" />
              </button>
              <button 
                onClick={() => sendMedia('video')}
                className="p-3 bg-zinc-50 text-zinc-400 rounded-2xl hover:bg-zinc-100 transition-all border border-zinc-100"
              >
                <Video className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              <Input 
                placeholder="Type a message..." 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="h-12 bg-zinc-50 border-zinc-100"
              />
            </div>
            <button 
              onClick={() => sendMessage()}
              className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Meeting Modal */}
        <AnimatePresence>
          {showMeetingModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMeetingModal(false)}
                className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-[calc(100vw-32px)] max-w-sm bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-2xl space-y-6 sm:space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">Schedule Meeting</h3>
                  <p className="text-zinc-500 text-sm font-medium">Propose a time to meet the client.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Date</label>
                    <Input 
                      type="date" 
                      value={meetingDetails.date}
                      onChange={(e) => setMeetingDetails({...meetingDetails, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Time</label>
                    <Input 
                      type="time" 
                      value={meetingDetails.time}
                      onChange={(e) => setMeetingDetails({...meetingDetails, time: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Location</label>
                    <Input 
                      placeholder="e.g. Client's Address" 
                      value={meetingDetails.location}
                      onChange={(e) => setMeetingDetails({...meetingDetails, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowMeetingModal(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={() => {
                    sendMessage(false, undefined, 'meeting', undefined, meetingDetails);
                    setShowMeetingModal(false);
                  }}>Schedule</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans pb-24 max-w-md mx-auto relative shadow-2xl shadow-zinc-200/50 overflow-hidden">
      
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[100] max-w-md mx-auto"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[101] shadow-2xl flex flex-col p-8 space-y-10"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black tracking-tighter text-zinc-900">
                  SKILL<span className="text-blue-600">LINK</span>
                </h1>
                <button 
                  onClick={() => setShowSidebar(false)}
                  className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                {(user?.role === 'worker' ? [
                  { id: 'earnings', icon: TrendingUp, label: 'My Earnings' },
                  { id: 'schedule', icon: Calendar, label: 'My Schedule' },
                  { id: 'jobs', icon: Briefcase, label: 'Job History' },
                  { id: 'settings', icon: Settings, label: 'Settings' },
                  { id: 'help', icon: HelpCircle, label: 'Help & Support' },
                  { id: 'share', icon: Share2, label: 'Invite Friends' },
                ] : [
                  { id: 'saved', icon: Bookmark, label: t.savedWorkers },
                  { id: 'jobs', icon: Briefcase, label: t.activeJobs },
                  { id: 'settings', icon: Settings, label: 'Settings' },
                  { id: 'help', icon: HelpCircle, label: 'Help & Support' },
                  { id: 'share', icon: Share2, label: 'Invite Friends' },
                ]).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (['saved', 'jobs', 'earnings', 'schedule'].includes(item.id)) {
                        setActiveTab(item.id);
                      }
                      setShowSidebar(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group",
                      activeTab === item.id ? "bg-blue-50 text-blue-600" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-900")} />
                    <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-8 border-t border-zinc-100">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-zinc-50/80 backdrop-blur-xl z-50 border-b border-zinc-100 max-w-md mx-auto w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSidebar(true)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100 text-zinc-900 hover:border-zinc-200 transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/10">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black leading-none text-zinc-900 tracking-tight">SkillLink</h2>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mt-1">Ethiopia</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === 'worker' && (
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-full">
              <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-300")} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {isOnline ? t.online : t.offline}
              </span>
            </div>
          )}
          <button className="relative p-2.5 bg-white rounded-xl border border-zinc-100 shadow-sm hover:bg-zinc-50 transition-colors">
            <Bell className="w-5 h-5 text-zinc-500" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-10">
        {activeTab === 'home' && (
          user?.role === 'client' ? (
            <>
              {/* Welcome Message */}
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">{t.welcomeBack}, {user.name.split(' ')[0]}!</h1>
                    <p className="text-zinc-500 text-sm font-medium">{t.findProfessional}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 p-1 shadow-xl shadow-zinc-200/30">
                    <img src={user.photo || `https://picsum.photos/seed/${user.id}/200`} alt="Profile" className="w-full h-full rounded-xl object-cover" />
                  </div>
                </div>
              </section>

              {/* Active Jobs for Client */}
              {jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">{t.activeJobs}</h3>
                  <div className="space-y-4">
                    {jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').map(job => (
                      <Card 
                        key={job.id} 
                        className="border-l-4 border-l-blue-600 bg-white cursor-pointer active:scale-[0.98] transition-all"
                        onClick={() => setActiveJob(job)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-black text-zinc-900">{job.workerName}</h4>
                            <p className="text-xs text-zinc-500 font-medium">{job.category} • {job.price} ETB</p>
                          </div>
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {job.status}
                          </span>
                        </div>
                        {job.status === 'accepted' && (
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest italic">Waiting for worker to start...</p>
                        )}
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Search */}
              <div className="space-y-4">
                <Input icon={Search} placeholder={t.searchPlaceholder} className="bg-white border-zinc-100 shadow-sm" />
              </div>

              {/* Categories / Trending */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tight text-zinc-900">{t.trending}</h3>
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className={cn("text-xs font-black uppercase tracking-widest", !selectedCategory ? "text-zinc-300" : "text-blue-600")}
                  >
                    {selectedCategory ? 'Clear Filter' : 'See All'}
                  </button>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
                  {categories.map((cat) => (
                    <button 
                      key={cat.id} 
                      onClick={() => setSelectedCategory(cat.name)}
                      className={cn(
                        "flex-shrink-0 flex flex-col items-center gap-4 transition-all",
                        selectedCategory === cat.name ? "scale-105" : "opacity-60"
                      )}
                    >
                      <div className={cn('w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-zinc-200/50 border border-white', cat.color)}>
                        {cat.icon}
                      </div>
                      <span className={cn("text-xs font-black uppercase tracking-widest", selectedCategory === cat.name ? "text-blue-600" : "text-zinc-500")}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Nearby Workers */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tight text-zinc-900">{t.nearby}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <MapPin className="w-3 h-3" /> {location ? 'Nearby' : 'Locating...'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {loading ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-16 space-y-4">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-zinc-400 text-xs font-black uppercase tracking-widest animate-pulse">Finding workers...</p>
                    </div>
                  ) : workers.length > 0 ? (
                    workers.map((worker) => (
                      <Card 
                        key={worker.id} 
                        onClick={() => setSelectedWorkerProfile(worker)}
                        className={cn(
                          "flex flex-col gap-3 group cursor-pointer hover:border-blue-500/30 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all bg-white border-zinc-50 p-4",
                          worker.online_status && "ring-2 ring-emerald-500/20 border-emerald-500/30"
                        )}
                      >
                        <div className="relative aspect-square w-full">
                          <div className="w-full h-full rounded-2xl bg-zinc-50 border border-zinc-100 overflow-hidden">
                            <img src={`https://picsum.photos/seed/${worker.name}/200`} alt={worker.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          {worker.online_status && (
                            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              Online
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-black text-zinc-900 text-sm tracking-tight truncate">{worker.name}</h4>
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 rounded-md shrink-0">
                              <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                              <span className="text-[8px] font-black text-amber-700">{Number(worker.rating).toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest truncate">
                            {worker.skills?.[0]}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-black text-zinc-900">{(worker.distance / 1000).toFixed(1)}km</span>
                            <span className="text-[10px] font-black text-zinc-400">ETB 500+</span>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 bg-white border border-dashed border-zinc-200 rounded-[40px] p-16 flex flex-col items-center text-center space-y-6 shadow-sm">
                      <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center">
                        <Search className="w-10 h-10 text-zinc-200" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-black text-xl text-zinc-900 tracking-tight">No workers found</h4>
                        <p className="text-zinc-400 text-sm font-medium max-w-[200px]">Try clearing filters or searching in a different area.</p>
                      </div>
                      <Button variant="outline" onClick={() => setSelectedCategory(null)} className="border-zinc-100 text-zinc-500 font-black uppercase tracking-widest text-xs">Clear Filters</Button>
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Worker Dashboard */}
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-black tracking-tight text-zinc-900">Dashboard</h1>
                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 p-1 shadow-sm">
                    <img src={user.photo || `https://picsum.photos/seed/${user.id}/200`} alt="Profile" className="w-full h-full rounded-xl object-cover" />
                  </div>
                </div>

                {/* Online/Offline Toggle Card */}
                <button 
                  onClick={() => setIsOnline(!isOnline)}
                  className={cn(
                    "w-full p-8 rounded-[32px] transition-all duration-500 relative overflow-hidden group text-left",
                    isOnline 
                      ? "bg-emerald-500 shadow-2xl shadow-emerald-500/20" 
                      : "bg-zinc-100 border border-zinc-200"
                  )}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em]",
                        isOnline ? "text-emerald-100" : "text-zinc-400"
                      )}>
                        Current Status
                      </p>
                      <h2 className={cn(
                        "text-3xl font-black tracking-tight",
                        isOnline ? "text-white" : "text-zinc-900"
                      )}>
                        {isOnline ? "Online" : "Offline"}
                      </h2>
                    </div>
                    <div className="relative">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500",
                        isOnline ? "bg-white/20 rotate-12" : "bg-zinc-200"
                      )}>
                        <Power className={cn(
                          "w-8 h-8",
                          isOnline ? "text-white" : "text-zinc-400"
                        )} />
                      </div>
                      {isOnline && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full">
                          <div className="absolute inset-0 bg-white rounded-full animate-ping" />
                        </div>
                      )}
                    </div>
                  </div>
                  {isOnline && (
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  )}
                </button>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="flex flex-col gap-2 p-5 bg-zinc-900 border-zinc-800 shadow-xl">
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Jobs Done</span>
                    <span className="text-xl font-black text-white">124</span>
                  </Card>
                  <Card className="flex flex-col gap-2 p-5 bg-zinc-900 border-zinc-800 shadow-xl">
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Rating</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-black text-white">4.9</span>
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    </div>
                  </Card>
                  <Card className="flex flex-col gap-2 p-5 bg-zinc-900 border-zinc-800 shadow-xl">
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Earnings</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-black text-white">12.4k</span>
                      <span className="text-[8px] font-black text-zinc-500 uppercase">ETB</span>
                    </div>
                  </Card>
                </div>

                {/* Incoming Requests */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black tracking-tight text-zinc-900">Incoming Requests</h3>
                    <span className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse">
                      2 New
                    </span>
                  </div>
                  
                  {!isOnline ? (
                    <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-[40px] p-16 flex flex-col items-center text-center space-y-4 shadow-sm">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Lock className="w-8 h-8 text-zinc-200" />
                      </div>
                      <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest max-w-[200px]">Go online to receive new job requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { id: 'req-1', name: 'Marta Tesfaye', service: 'Electrician', rating: 4.8, photo: 'marta' },
                        { id: 'req-2', name: 'Dawit Abebe', service: 'House Painting', rating: 4.5, photo: 'dawit' }
                      ].map((req) => (
                        <Card key={req.id} className="p-6 bg-white border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 overflow-hidden">
                              <img src={`https://picsum.photos/seed/${req.photo}/200`} alt={req.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-black text-zinc-900 tracking-tight">{req.name}</h4>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 rounded-lg">
                                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                  <span className="text-[9px] font-black text-amber-700">{req.rating}</span>
                                </div>
                              </div>
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{req.service}</p>
                            </div>
                          </div>
                          <div className="flex gap-3 pt-2">
                            <Button className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-emerald-500/20">
                              Accept
                            </Button>
                            <Button variant="outline" className="flex-1 h-12 border-red-100 text-red-500 hover:bg-red-50 font-black uppercase tracking-widest text-[10px] rounded-2xl">
                              Decline
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Jobs for Worker */}
                <div className="space-y-6">
                  <h3 className="text-xl font-black tracking-tight text-zinc-900">{t.activeJobs}</h3>
                  {jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length === 0 ? (
                    <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-[40px] p-12 text-center shadow-sm">
                      <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{t.noJobs}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').map(job => (
                        <Card key={job.id} className="p-6 bg-zinc-900 border-zinc-800 shadow-xl space-y-6">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden">
                                <img src={`https://picsum.photos/seed/${job.clientName}/200`} alt={job.clientName} className="w-full h-full object-cover opacity-80" />
                              </div>
                              <div>
                                <h4 className="font-black text-white tracking-tight">{job.clientName}</h4>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{job.category} • {job.price} ETB</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest">
                              {job.status}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            {job.status === 'accepted' && (
                              <Button className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/20" onClick={() => updateJobStatus(job.id, 'in-progress')}>
                                {t.startJob}
                              </Button>
                            )}
                            {job.status === 'in-progress' && (
                              <Button className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20" onClick={() => updateJobStatus(job.id, 'completed')}>
                                {t.completeJob}
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )
        )}

        {activeTab === 'saved' && (
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900">{t.savedWorkers}</h1>
              <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                {savedWorkerIds.length} Saved
              </div>
            </div>

            <div className="space-y-4">
              {savedWorkerIds.length > 0 ? (
                workers.filter(w => savedWorkerIds.includes(w.id)).map((worker) => (
                  <Card 
                    key={worker.id} 
                    onClick={() => setSelectedWorkerProfile(worker)}
                    className={cn(
                      "flex items-center gap-5 cursor-pointer hover:border-blue-500/30 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all bg-white border-zinc-50 relative",
                      worker.online_status && "ring-2 ring-emerald-500/20 border-emerald-500/30"
                    )}
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveWorker(worker.id);
                      }}
                      className="absolute top-4 right-4 z-10"
                    >
                      <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </button>

                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-zinc-100 overflow-hidden border border-zinc-200">
                        <img src={`https://picsum.photos/seed/${worker.name}/200`} alt={worker.name} className="w-full h-full object-cover" />
                      </div>
                      <div className={cn(
                        "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                        worker.online_status ? "bg-emerald-500" : "bg-zinc-300"
                      )} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center pr-8">
                        <div>
                          <h4 className="font-black text-zinc-900 tracking-tight">{worker.name}</h4>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{worker.skills?.join(' • ')}</p>
                        </div>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 rounded-lg">
                          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                          <span className="text-[9px] font-black text-amber-700">{Number(worker.rating).toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {(worker.distance / 1000).toFixed(1)} km
                          </div>
                          <div className="w-1 h-1 rounded-full bg-zinc-200" />
                          <span>{worker.jobs_completed} jobs</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveChat({ id: worker.id, name: worker.name });
                            setActiveTab('messages');
                          }}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Message
                        </button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center relative">
                    <Bookmark className="w-10 h-10 text-zinc-200" />
                    <div className="absolute inset-0 border-2 border-dashed border-zinc-100 rounded-full animate-[spin_10s_linear_infinite]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-xl text-zinc-900 tracking-tight">{t.noSavedWorkers}</h4>
                    <p className="text-zinc-400 text-sm font-medium max-w-[200px]">Workers you bookmark will appear here for quick access.</p>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('explore')}
                    className="bg-zinc-900 text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-2xl"
                  >
                    Explore Workers
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'jobs' && (
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900">{t.myJobs}</h1>
              <div className="px-3 py-1 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                {filteredJobs.length} {t.all}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
              {(['all', 'active', 'completed', 'disputed'] as const).map((filter) => (
                <button 
                  key={filter} 
                  onClick={() => setJobFilter(filter)}
                  className={cn(
                    "flex-shrink-0 px-6 py-3 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition-all",
                    jobFilter === filter ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white border-zinc-100 text-zinc-400"
                  )}
                >
                  {t[filter as keyof typeof t.EN]}
                </button>
              ))}
            </div>
            
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => {
                  const isDisputed = disputes.some(d => d.jobId === job.id);
                  const isExpanded = expandedJobId === job.id;
                  
                  return (
                    <Card 
                      key={job.id} 
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                      className={cn(
                        "bg-zinc-900 border-zinc-800 p-6 transition-all cursor-pointer relative overflow-hidden group",
                        isExpanded ? "ring-2 ring-amber-500/50" : "hover:bg-zinc-800"
                      )}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800 overflow-hidden border border-zinc-700">
                          <img 
                            src={`https://picsum.photos/seed/${job.workerName}/200`} 
                            alt={job.workerName} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-black text-white tracking-tight text-lg">{job.workerName}</h4>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {(job.category ? [job.category] : ['Service']).map((s, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-zinc-700">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                              isDisputed ? "bg-red-500/10 text-red-500 border-red-500/20" :
                              job.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                              "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            )}>
                              {isDisputed ? t.disputed : job.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Price</p>
                            <p className="text-sm font-black text-white">{job.price} ETB</p>
                          </div>
                          <div className="w-px h-6 bg-zinc-800" />
                          <div>
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Date</p>
                            <p className="text-sm font-black text-zinc-400">
                              {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          "w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center transition-transform",
                          isExpanded ? "rotate-180" : ""
                        )}>
                          <ChevronDown className="w-4 h-4 text-zinc-500" />
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-6 pt-6 border-t border-zinc-800 space-y-4"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-800">
                                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Job ID</p>
                                <p className="text-xs font-black text-zinc-300">#{job.id.slice(-8).toUpperCase()}</p>
                              </div>
                              <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-800">
                                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Category</p>
                                <p className="text-xs font-black text-zinc-300">{job.category}</p>
                              </div>
                            </div>

                            {job.status === 'completed' && (
                              <Button 
                                variant="outline" 
                                className="w-full border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveJob(job);
                                  setShowReviewModal(true);
                                }}
                              >
                                View Review
                              </Button>
                            )}

                            {job.status !== 'completed' && !isDisputed && (
                              <div className="flex gap-3">
                                <Button 
                                  className="flex-1 bg-blue-600 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveChat({ id: job.workerId, name: job.workerName });
                                    setActiveTab('messages');
                                  }}
                                >
                                  Message
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDisputeJob(job);
                                    setShowDisputeScreen(true);
                                  }}
                                >
                                  Dispute
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })
              ) : (
                <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center relative">
                    <HardHat className="w-10 h-10 text-zinc-200" />
                    <div className="absolute inset-0 border-2 border-dashed border-zinc-100 rounded-full animate-[spin_10s_linear_infinite]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-xl text-zinc-900 tracking-tight">{t.noJobsFound}</h4>
                    <p className="text-zinc-400 text-sm font-medium max-w-[200px]">
                      {user?.role === 'worker' 
                        ? "Your completed and active jobs will appear here. Go online to receive new requests!" 
                        : "Your jobs will appear here once you start hiring professionals."}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('explore')}
                    className="bg-zinc-900 text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-2xl"
                  >
                    Find Workers
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'explore' && (
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900">{t.explore}</h1>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "p-3 rounded-2xl border transition-all",
                  showFilters ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white border-zinc-100 text-zinc-400"
                )}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input 
                icon={Search} 
                placeholder={t.searchPlaceholder} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-zinc-100 shadow-sm"
              />
              
              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <Card className="bg-white border-zinc-100 p-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Distance</h4>
                          <span className="text-xs font-black text-blue-600">{filterDistance} km</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="50" 
                          value={filterDistance}
                          onChange={(e) => setFilterDistance(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Minimum Rating</h4>
                        <div className="flex gap-2">
                          {[0, 3, 4, 4.5].map((rating) => (
                            <button 
                              key={rating}
                              onClick={() => setFilterRating(rating)}
                              className={cn(
                                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                filterRating === rating ? "bg-blue-600 border-blue-600 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-500"
                              )}
                            >
                              {rating === 0 ? 'Any' : `${rating}+`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Online Now</h4>
                        <button 
                          onClick={() => setFilterOnlineOnly(!filterOnlineOnly)}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            filterOnlineOnly ? "bg-emerald-500" : "bg-zinc-200"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            filterOnlineOnly ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>

                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          className="w-full h-10 text-[10px] uppercase tracking-widest font-black"
                          onClick={() => {
                            setFilterDistance(10);
                            setFilterRating(0);
                            setFilterOnlineOnly(false);
                            setSearchQuery('');
                            setSelectedCategory(null);
                          }}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                  className={cn(
                    "flex-shrink-0 px-6 py-3 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition-all",
                    selectedCategory === cat.name ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white border-zinc-100 text-zinc-400"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tight text-zinc-900">
                  {searchQuery || selectedCategory ? 'Search Results' : 'Top Rated Workers'}
                </h3>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  {filteredWorkers.length} Found
                </span>
              </div>
              
              <div className="space-y-4">
                {filteredWorkers.length > 0 ? (
                  filteredWorkers.map((worker) => (
                    <Card 
                      key={worker.id} 
                      onClick={() => setSelectedWorkerProfile(worker)}
                      className={cn(
                        "flex items-center gap-5 cursor-pointer hover:border-blue-500/30 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all bg-white border-zinc-50 relative",
                        worker.online_status && "ring-2 ring-emerald-500/20 border-emerald-500/30"
                      )}
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveWorker(worker.id);
                        }}
                        className="absolute top-4 right-4 z-10 p-2"
                      >
                        <Bookmark className={cn(
                          "w-5 h-5 transition-all",
                          savedWorkerIds.includes(worker.id) ? "text-amber-500 fill-amber-500 scale-110" : "text-zinc-200 hover:text-zinc-400"
                        )} />
                      </button>

                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-zinc-100 overflow-hidden border border-zinc-200">
                          <img src={`https://picsum.photos/seed/${worker.name}/200`} alt={worker.name} className="w-full h-full object-cover" />
                        </div>
                        <div className={cn(
                          "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                          worker.online_status ? "bg-emerald-500" : "bg-zinc-300"
                        )} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-black text-zinc-900 tracking-tight">{worker.name}</h4>
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 rounded-lg">
                            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                            <span className="text-[9px] font-black text-amber-700">{Number(worker.rating).toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{worker.skills?.join(' • ')}</p>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {(worker.distance / 1000).toFixed(1)} km
                          </div>
                          <div className="w-1 h-1 rounded-full bg-zinc-200" />
                          <span>{worker.jobs_completed} jobs</span>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center">
                      <Search className="w-10 h-10 text-zinc-200" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-zinc-900 uppercase tracking-widest">No results found</h4>
                      <p className="text-zinc-400 text-xs font-medium">Try adjusting your filters or search query.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'community' && (
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900">{t.community}</h1>
              <button 
                onClick={() => setShowCreatePostModal(true)}
                className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Post Type Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
              {[
                { id: 'all', label: t.all },
                { id: 'tip', label: t.tips },
                { id: 'question', label: t.questions },
                { id: 'recommendation', label: t.recommendations },
                { id: 'before_after', label: t.beforeAfter }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setCommunityFilter(filter.id)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                    communityFilter === filter.id 
                      ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20" 
                      : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Posts Feed */}
            <div className="space-y-6 pb-10">
              {posts
                .filter(p => communityFilter === 'all' || p.type === communityFilter)
                .map((post) => (
                  <Card key={post.id} className="bg-zinc-900 border-zinc-800 p-6 space-y-4 shadow-2xl shadow-zinc-900/20">
                    {/* Post Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-800">
                          <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-white text-sm tracking-tight">{post.authorName}</h4>
                            {post.isWorker && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
                              {post.type.replace('_', '/')}
                            </span>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                              {Math.floor((Date.now() - post.createdAt.getTime()) / 3600000)}h ago
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-4">
                      <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                        {post.content}
                      </p>
                      {post.photo && (
                        <div className="rounded-2xl overflow-hidden border border-zinc-800">
                          <img src={post.photo} alt="Post" className="w-full h-auto object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 group">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                            <Heart className="w-4 h-4 text-zinc-500 group-hover:text-red-500 transition-colors" />
                          </div>
                          <span className="text-xs font-black text-zinc-500 group-hover:text-red-500 transition-colors">{post.likes}</span>
                        </button>
                        <button 
                          onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                          className="flex items-center gap-2 group"
                        >
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                            <MessageSquare className="w-4 h-4 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <span className="text-xs font-black text-zinc-500 group-hover:text-blue-500 transition-colors">{post.comments.length}</span>
                        </button>
                      </div>
                      <button className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                        <Share2 className="w-4 h-4 text-zinc-500" />
                      </button>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                      {expandedPostId === post.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-4 pt-4 border-t border-zinc-800/50"
                        >
                          {post.comments.length > 0 ? (
                            <div className="space-y-4">
                              {post.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0" />
                                  <div className="flex-1 bg-zinc-800/50 rounded-2xl p-3 space-y-1">
                                    <h5 className="text-[10px] font-black text-white uppercase tracking-widest">{comment.authorName}</h5>
                                    <p className="text-xs text-zinc-400 font-medium">{comment.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center py-4 text-zinc-600 text-[10px] font-black uppercase tracking-widest italic">No comments yet. Be the first!</p>
                          )}
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Write a comment..." 
                              className="flex-1 bg-zinc-800 border-none rounded-xl px-4 py-2 text-xs text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-amber-500"
                            />
                            <button className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))}
            </div>
          </section>
        )}

        {activeTab === 'messages' && (
          <section className="space-y-8">
            <h1 className="text-3xl font-black tracking-tight text-zinc-900">{t.messages}</h1>
            <div className="space-y-2">
              {[
                { id: '1', name: 'Marta Tesfaye', lastMsg: 'I accept the estimate.', time: '2m ago', unread: true },
                { id: '2', name: 'Dawit Abebe', lastMsg: 'When can you arrive?', time: '1h ago', unread: false },
                { id: '3', name: 'Sara Kebede', lastMsg: 'Thank you for the work!', time: 'Yesterday', unread: false },
              ].map((chat) => (
                <button 
                  key={chat.id} 
                  onClick={() => setActiveChat({ id: chat.id, name: chat.name })}
                  className="w-full flex items-center gap-4 p-4 rounded-[32px] hover:bg-white transition-all group border border-transparent hover:border-zinc-100"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 overflow-hidden border border-zinc-200">
                      <img src={`https://picsum.photos/seed/${chat.name}/200`} alt={chat.name} className="w-full h-full object-cover" />
                    </div>
                    {chat.unread && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-zinc-50" />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-black text-zinc-900 tracking-tight">{chat.name}</h4>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{chat.time}</span>
                    </div>
                    <p className={cn("text-xs line-clamp-1", chat.unread ? "text-zinc-900 font-bold" : "text-zinc-400 font-medium")}>
                      {chat.lastMsg}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'earnings' && (
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900">My Earnings</h1>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>

            {/* Total Earnings Hero Card */}
            <Card className="bg-zinc-900 border-zinc-800 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-all duration-700" />
              <div className="relative z-10 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Total Balance</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl font-black text-amber-500 tracking-tighter">12,450</h2>
                  <span className="text-xl font-black text-amber-500/50 uppercase tracking-widest">ETB</span>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-lg">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-500">+12.5%</span>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">vs last month (11,060 ETB)</p>
                </div>
              </div>
            </Card>

            {/* Earnings Chart */}
            <Card className="bg-zinc-900 border-zinc-800 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Earnings Overview</h3>
                <div className="flex gap-2">
                  {(['week', 'month', 'all'] as const).map((filter) => (
                    <button 
                      key={filter}
                      onClick={() => setEarningsFilter(filter)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                        earningsFilter === filter ? "bg-amber-500 text-white" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'All Time'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#71717a', fontSize: 10, fontWeight: 900 }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#f59e0b', fontSize: 12, fontWeight: 900 }}
                      labelStyle={{ color: '#71717a', fontSize: 10, fontWeight: 900, marginBottom: 4 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAmt)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Recent Payments */}
            <section className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Recent Payments</h3>
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <Card key={payment.id} className="bg-white border-zinc-100 p-5 flex items-center justify-between group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-zinc-900 tracking-tight">{payment.service}</h4>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          {payment.client} • {payment.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-emerald-600 tracking-tight">+{payment.amount} ETB</p>
                      <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Fee: -{payment.fee} ETB</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </section>
        )}

        {activeTab === 'schedule' && (
          <section className="space-y-8 pb-32">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900">My Schedule</h1>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
            </div>

            <div className="space-y-4">
              {schedule.map((day, idx) => (
                <Card key={day.day} className={cn(
                  "p-6 border-zinc-100 transition-all duration-300",
                  day.active ? "bg-white border-amber-500/20 shadow-lg shadow-amber-500/5" : "bg-zinc-50/50 opacity-60"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="w-24">
                      <h3 className="font-black text-zinc-900 tracking-tight">{day.day}</h3>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        {day.active ? 'Available' : 'Off'}
                      </p>
                    </div>

                    <div className={cn(
                      "flex-1 flex justify-center transition-all",
                      day.active ? "opacity-100" : "opacity-30 grayscale"
                    )}>
                      <div className="bg-zinc-900 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl">
                        <span className="text-xs font-black text-amber-500 tracking-widest">{day.start}</span>
                        <div className="w-2 h-[1px] bg-zinc-700" />
                        <span className="text-xs font-black text-amber-500 tracking-widest">{day.end}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const newSchedule = [...schedule];
                        newSchedule[idx].active = !newSchedule[idx].active;
                        setSchedule(newSchedule);
                      }}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative p-1",
                        day.active ? "bg-amber-500" : "bg-zinc-200"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                        day.active ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="fixed bottom-24 left-0 right-0 p-6 bg-gradient-to-t from-zinc-50 via-zinc-50/90 to-transparent z-40 max-w-md mx-auto">
              <Button 
                onClick={() => {
                  setActiveTab('home');
                }}
                className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-amber-500/20"
              >
                Save Schedule
              </Button>
            </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="space-y-10">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-[48px] bg-white p-1 shadow-2xl shadow-zinc-200/50">
                  <div className="w-full h-full rounded-[44px] bg-zinc-100 overflow-hidden border border-zinc-100">
                    <img src={user?.photo || `https://picsum.photos/seed/${user?.id}/400`} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 border-4 border-zinc-50">
                  <User className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{user?.name || 'User'}</h2>
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mt-1">{user?.role === 'worker' ? 'Professional Worker' : 'Client Account'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">Account Settings</h3>
              <div className="space-y-2">
                {[
                  { icon: User, label: 'Edit Profile', color: 'text-zinc-600' },
                  { icon: Bell, label: 'Notifications', color: 'text-zinc-600' },
                  { icon: ShieldCheck, label: 'Security', color: 'text-zinc-600' },
                  { icon: Globe, label: 'Language', color: 'text-zinc-600' },
                  { icon: LogOut, label: 'Sign Out', color: 'text-red-500', onClick: handleSignOut },
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-6 bg-white rounded-[32px] border border-zinc-50 hover:border-zinc-100 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
                        <item.icon className={cn("w-5 h-5", item.color)} />
                      </div>
                      <span className={cn("text-sm font-black uppercase tracking-widest", item.color)}>{item.label}</span>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-zinc-200 rotate-180" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePostModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 bg-zinc-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full h-full max-w-md bg-white flex flex-col"
            >
              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b border-zinc-100">
                <h3 className="text-xl font-black text-zinc-900 tracking-tight">{t.newPost}</h3>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      if (newPostContent.trim()) {
                        const newPost: CommunityPost = {
                          id: Math.random().toString(36).substr(2, 9),
                          authorId: user?.id || 'anon',
                          authorName: user?.name || 'Anonymous',
                          authorPhoto: user?.photo || `https://picsum.photos/seed/${user?.id}/200`,
                          isWorker: user?.role === 'worker',
                          type: newPostType,
                          content: newPostContent,
                          likes: 0,
                          comments: [],
                          createdAt: new Date()
                        };
                        setPosts([newPost, ...posts]);
                        setNewPostContent('');
                        setShowCreatePostModal(false);
                      }
                    }}
                    disabled={!newPostContent.trim()}
                    className={cn(
                      "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                      newPostContent.trim() 
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
                        : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                    )}
                  >
                    {t.post}
                  </button>
                  <button onClick={() => setShowCreatePostModal(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Post Type Selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t.postType}</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                      { id: 'recommendation', label: t.recommendations },
                      { id: 'tip', label: t.tips },
                      { id: 'question', label: t.questions },
                      { id: 'before_after', label: t.beforeAfter }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setNewPostType(type.id as CommunityPost['type'])}
                        className={cn(
                          "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                          newPostType === type.id 
                            ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/10" 
                            : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:border-zinc-200"
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Input Area */}
                <div className="relative">
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value.slice(0, 500))}
                    placeholder={t.postPlaceholder}
                    className="w-full h-64 bg-zinc-900 text-white rounded-[32px] p-8 text-lg font-medium placeholder:text-zinc-600 focus:ring-0 border-none transition-all resize-none shadow-2xl shadow-zinc-900/20"
                  />
                  <div className="absolute bottom-6 right-8 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    {newPostContent.length} / 500
                  </div>
                </div>

                {/* Photo Upload Row */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Add Photos</label>
                  <div className="flex gap-4">
                    {[1, 2, 3].map((i) => (
                      <button 
                        key={i}
                        className="w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2 text-zinc-300 hover:border-amber-500/50 hover:text-amber-500 transition-all group"
                      >
                        <Camera className="w-6 h-6" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Slot {i}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Safety Notice */}
                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <Info className="w-5 h-5 text-zinc-400" />
                  <p className="text-xs text-zinc-500 font-medium">{t.safetyNotice}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-[calc(100vw-32px)] max-w-md bg-white border border-zinc-100 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 space-y-8 sm:space-y-10 shadow-2xl"
            >
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-12 h-12 text-amber-500 fill-amber-500" />
                </div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">{t.reviewTitle}</h2>
                <p className="text-zinc-500 text-sm font-medium">{t.reviewSubtitle} {activeJob?.workerName}</p>
              </div>

              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
                {[
                  { key: 'quality', label: 'Quality of work' },
                  { key: 'punctuality', label: 'Punctuality' },
                  { key: 'communication', label: 'Communication' },
                  { key: 'priceFairness', label: 'Price fairness' },
                  { key: 'overall', label: 'Overall' },
                ].map((cat) => (
                  <div key={cat.key} className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{cat.label}</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          onClick={() => setReviewRatings(prev => ({ ...prev, [cat.key]: star }))}
                          className="p-1 transition-all active:scale-90"
                        >
                          <Star className={cn(
                            "w-8 h-8 transition-colors",
                            star <= reviewRatings[cat.key as keyof typeof reviewRatings] ? "text-amber-500 fill-amber-500" : "text-zinc-100"
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <textarea 
                  placeholder={t.commentPlaceholder}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-[32px] p-8 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500/50 transition-all min-h-[160px] resize-none text-sm font-medium"
                />
                <Button className="w-full h-16 font-black uppercase tracking-widest text-sm" onClick={submitReview}>
                  {t.submitReview}
                </Button>
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="w-full text-zinc-400 text-xs font-black uppercase tracking-widest py-2 hover:text-zinc-600 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-zinc-100 px-2 py-3 flex justify-around items-center z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] max-w-md mx-auto">
        {(user?.role === 'worker' ? [
          { id: 'community', icon: Globe, label: t.community },
          { id: 'home', icon: Home, label: 'Dashboard' },
          { id: 'jobs', icon: Briefcase, label: 'Jobs' },
          { id: 'messages', icon: MessageSquare, label: t.messages },
          { id: 'profile', icon: User, label: t.profile },
        ] : [
          { id: 'community', icon: Globe, label: t.community },
          { id: 'home', icon: Home, label: t.home },
          { id: 'explore', icon: Search, label: t.explore },
          { id: 'messages', icon: MessageSquare, label: t.messages },
          { id: 'profile', icon: User, label: t.profile },
        ]).map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              'flex flex-col items-center gap-1 transition-all px-2 py-1.5 rounded-xl relative group min-w-[64px]',
              activeTab === item.id ? 'text-blue-600' : 'text-zinc-300 hover:text-zinc-500'
            )}
          >
            {activeTab === item.id && (
              <motion.div 
                layoutId="nav-active"
                className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className={cn('w-5 h-5 transition-transform group-active:scale-90', activeTab === item.id && 'fill-blue-600/10')} />
            <span className="text-[8px] font-black uppercase tracking-tight text-center leading-none">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
