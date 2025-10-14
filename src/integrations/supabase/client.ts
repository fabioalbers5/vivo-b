import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuração usando variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://jstytygxbnapydwkvpzk.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "API_KEY";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and Anon Key are required. Please check your environment variables.');
}

if (SUPABASE_ANON_KEY === "API_KEY") {
  console.warn('⚠️  Using placeholder API_KEY. Please set VITE_SUPABASE_ANON_KEY in your .env file');
}

// Cliente Supabase configurado com autenticação e storage
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'vivo-contract-insight',
    },
  },
});
