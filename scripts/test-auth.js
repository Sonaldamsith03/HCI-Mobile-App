const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const configFile = fs.readFileSync(path.join(__dirname, '../src/config/supabase.ts'), 'utf8');
const urlMatch = configFile.match(/SUPABASE_URL:\s*string\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = configFile.match(/SUPABASE_ANON_KEY:\s*string\s*=\s*['"]([^'"]+)['"]/);

const url = urlMatch ? urlMatch[1] : '';
const key = keyMatch ? keyMatch[1] : '';

const supabase = createClient(url, key);

async function testAuth() {
  console.log('Testing Supabase Auth API & Profiles Table...');
  
  // Test reading profiles table
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(3);
  if (pErr) {
    console.error('❌ Profiles Table Query Error:', pErr.message);
  } else {
    console.log('✅ Profiles table is accessible. Current profiles count:', profiles.length);
  }

  // Test reading drivers table
  const { data: drivers, error: dErr } = await supabase.from('drivers').select('id, name, availability_status').limit(3);
  if (dErr) {
    console.error('❌ Drivers Table Query Error:', dErr.message);
  } else {
    console.log('✅ Drivers table is accessible. Total seed drivers:', drivers.length);
  }
}

testAuth();
