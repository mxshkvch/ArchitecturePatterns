export interface Account {
  id: string;
  accountNumber: string;
  userId: string;
  balance: number | string;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'CLOSED';
  createdAt: string;
  closedAt: string | null;
  version?: number;
}

export interface MasterAccount extends Account {
  isMasterAccount: true;
  description?: string;
}