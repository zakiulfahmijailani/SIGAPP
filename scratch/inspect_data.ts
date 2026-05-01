import { getSupabase } from "../src/lib/supabase";

async function inspect() {
  const { data, error } = await getSupabase()
    .from("school_index")
    .select("sigapp_index, priority_tier")
    .limit(10);
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log("Sample Data:", JSON.stringify(data, null, 2));
  
  const ranges = {
    sangat: data.filter(d => d.sigapp_index >= 0.8).length,
    tinggi: data.filter(d => d.sigapp_index >= 0.6 && d.sigapp_index < 0.8).length,
    sedang: data.filter(d => d.sigapp_index >= 0.4 && d.sigapp_index < 0.6).length,
    rendah: data.filter(d => d.sigapp_index >= 0.2 && d.sigapp_index < 0.4).length,
    tidak: data.filter(d => d.sigapp_index < 0.2).length,
  };
  
  console.log("Ranges:", ranges);
}

inspect();
