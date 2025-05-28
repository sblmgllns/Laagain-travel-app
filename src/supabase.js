import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = "https://hqhlhotapzwxyqsofqwz.supabase.co";
// const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaGxob3RhcHp3eHlxc29mcXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NDM5NTAsImV4cCI6MjA1NTAxOTk1MH0.wbRgykJ2mkTPFY090D2NBYcGwSzmHyM4FIWTLTL867w";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY 
console.log("SUPABASE KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
