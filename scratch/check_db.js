const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const sb = createClient(url, key);

  console.log('Checking pillar_variables table...');
  const { data, error } = await sb.from('pillar_variables').select('*').limit(5);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data:', data);
  }

  console.log('\nChecking schools join...');
  const { data: joinData, error: joinError } = await sb.from('schools').select('id, pillar_variables(*)').limit(1);
  if (joinError) {
    console.error('Join Error:', joinError);
  } else {
    console.log('Join Data:', joinData);
  }
}

check();
