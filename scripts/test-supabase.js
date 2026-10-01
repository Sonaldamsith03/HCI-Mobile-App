// Quick Supabase Connection Test Script
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read config
const configFile = fs.readFileSync(path.join(__dirname, '../src/config/supabase.ts'), 'utf8');

const urlMatch = configFile.match(/SUPABASE_URL:\s*string\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = configFile.match(/SUPABASE_ANON_KEY:\s*string\s*=\s*['"]([^'"]+)['"]/);

const url = urlMatch ? urlMatch[1] : '';
const key = keyMatch ? keyMatch[1] : '';

console.log('Testing Supabase Connection...');
console.log('URL:', url);
console.log('Key:', key ? `${key.substring(0, 15)}...` : '(empty)');

if (!url || !key || url.includes('YOUR_SUPABASE_PROJECT_ID') || key.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.log('\n⚠️ Supabase credentials have NOT been pasted into src/config/supabase.ts yet.');
  console.log('Please open src/config/supabase.ts and paste your Project URL and Publishable/Anon API key.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('produce').select('id, name, price, farmer_name').limit(3);
    if (error) {
      console.error('\n❌ Connection Error:', error.message);
      return;
    }
    console.log('\n✅ Successfully connected to Supabase!');
    console.log(`Retrieved ${data.length} sample produce rows from table 'produce':`);
    console.table(data);

    const { data: drivers, error: driverErr } = await supabase.from('drivers').select('id, name, availability_status, vehicle_id').limit(3);
    if (!driverErr && drivers) {
      console.log(`\nRetrieved ${drivers.length} drivers from table 'drivers':`);
      console.table(drivers);
    }
  } catch (err) {
    console.error('\n❌ Unexpected error testing connection:', err);
  }
}

testConnection();
