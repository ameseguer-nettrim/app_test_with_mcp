export interface Person {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface Environment {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  expense_date: Date;
  payer_id: number;
  registered_by_id: number;
  environment_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ComputedExpense {
  id: number;
  expense_id: number;
  amount: number;
  description: string;
  expense_date: Date;
  payer_id: number;
  registered_by_id: number;
  environment_id: number;
  computed_at: Date;
  computed_by_id: number;
}

export interface JwtPayload {
  personId: number;
  email: string;
}

export interface AuthRequest extends Request {
  person?: JwtPayload;
}