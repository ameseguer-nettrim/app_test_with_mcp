export interface Person {
  id: number;
  name: string;
  email: string;
}

export interface Environment {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  expense_date: string;
  payer_id: number;
  payer_name: string;
  registered_by_id: number;
  registered_by_name: string;
  environment_id: number;
  created_at: string;
  updated_at: string;
}

export interface ComputedExpense {
  id: number;
  expense_id: number;
  amount: number;
  description: string;
  expense_date: string;
  payer_id: number;
  payer_name: string;
  registered_by_id: number;
  registered_by_name: string;
  environment_id: number;
  computed_at: string;
  computed_by_id: number;
  computed_by_name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  person: Person;
  message: string;
}

export interface CreateExpenseData {
  amount: number;
  description: string;
  expense_date: string;
  payer_id: number;
  environment_id: number;
}

export interface CreateEnvironmentData {
  name: string;
  description?: string;
}

export interface Person {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  created_at?: Date;
  environment_id?: number;
}
