export type UserRole = 'GAMER' | 'CRITIC' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  bio?: string;
  badges: string[];
}

export type PlayerMode = 'Singleplayer' | 'Multiplayer' | 'Co-op' | 'MMO';

export interface SystemRequirements {
  os: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  coverImage: string;
  bannerImage: string;
  category: string;
  playerModes: PlayerMode[];
  developer: string;
  publisher: string;
  releaseDate: string;
  price: number;
  tags: string[];
  systemRequirements: {
    minimum: SystemRequirements;
    recommended: SystemRequirements;
  };
  ratingStats: {
    averageRating: number;
    totalReviews: number;
    positivePercentage: number;
    starDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  gameId: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  isAnonymous: boolean;
  rating: number;
  isRecommended: boolean;
  title: string;
  content: string;
  hoursPlayed?: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  votedUserIds?: string[];
  createdAt: string;
  updatedAt: string;
  verifiedPurchase?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  resource: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  details: string;
  timestamp: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
