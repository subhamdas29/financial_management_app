export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'SALARY' | 'FIXED_DEPOSIT';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  _count?: { transactions: number };
}

export interface Folder {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color?: string;
  icon?: string;
  description?: string;
  budgetLimit?: number;
  createdAt: string;
  _count?: { transactions: number };
}

export interface Transaction {
  id: string;
  accountId: string;
  folderId?: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  merchant?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  transactedAt: string;
  folder?: { id: string; name: string; type: string; color?: string };
  account?: { id: string; name: string; currency: string };
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  status: string;
  transferredAt: string;
  fromAccount?: { id: string; name: string; currency: string };
  toAccount?: { id: string; name: string; currency: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}