// types/rules.ts

export interface Rule {
    id: string;
    description?: string;
    enabled: boolean;
    rule_type_id: string;
    schedule?: { interval?: string };
    tags?: string[];
    actions?: unknown[];
    // autres champs selon usage...
    [key: string]: unknown;
  }
  
  export interface RulesFindResponse {
    page: number;
    per_page: number;
    total: number;
    data: Rule[];
  }
  