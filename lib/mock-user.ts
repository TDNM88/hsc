import { createContext, useContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  balance: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  uid: string;
  minimumBet?: number;
  minimumDeposit?: number;
  minimumWithdraw?: number;
  isLockWithdraw?: boolean;
}

const mockUser: User = {
  id: 'mock-user-123',
  uid: 'mock-user-123',
  email: 'guest@example.com',
  name: 'Guest User',
  username: 'guest',
  role: 'user',
  balance: 1000000,
  isVerified: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  minimumBet: 10000,
  minimumDeposit: 50000,
  minimumWithdraw: 100000,
  isLockWithdraw: false,
};

export const MockUserContext = createContext<User>(mockUser);

export const useMockUser = () => {
  return useContext(MockUserContext);
};

export const useMockAuth = () => {
  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    isAdmin: false,
  };
};
