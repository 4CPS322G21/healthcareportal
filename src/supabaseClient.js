import { createClient } from '@supabase/supabase-js';

// Use environment variables when available for deployment; fall back to the
// development values used in the project.
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://xjdstsoceomfftanuhjy.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqZHN0c29jZW9tZmZ0YW51aGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjMxOTEsImV4cCI6MjA3MDEzOTE5MX0.Gxo9ctAls5hCVMh_MsfANFstc64cL2uuiVaaHjWViAE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
