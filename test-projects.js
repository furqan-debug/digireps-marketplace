import { createClient } from '@supabase/supabase-js';

const url = "https://dlfxnlnaagptismucdpn.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZnhubG5hYWdwdGlzbXVjZHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzEwMDcsImV4cCI6MjA4NjkwNzAwN30.QUD-ZPValKkMk2L_6T39_ad1ajiZcbvl_kM-p0J55xs";
const supabase = createClient(url, key);

async function check() {
    const { data, error } = await supabase.from('projects').select('*');
    console.log("Projects:", JSON.stringify(data, null, 2));
    if (error) console.error("Error:", error);
}

check();
