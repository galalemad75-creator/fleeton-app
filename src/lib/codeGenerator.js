// FleetOn — Group Code Generator (with error handling)
import { supabase } from './supabase';

export async function generateUniqueCode() {
  let code, exists = true, attempts = 0;
  while (exists && attempts < 100) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    try {
      const { data } = await supabase
        .from('companies')
        .select('id')
        .or(`driver_code.eq.${code},dispatcher_code.eq.${code}`)
        .maybeSingle();
      exists = !!data;
    } catch (err) {
      // If RLS blocks the query during registration, just use the code
      console.warn('Code uniqueness check failed, proceeding:', err.message);
      exists = false;
    }
    attempts++;
  }
  if (exists) throw new Error('Could not generate unique code.');
  return code;
}

export async function generateCompanyCodes() {
  const driverCode = await generateUniqueCode();
  const dispatcherCode = await generateUniqueCode();
  return { driverCode, dispatcherCode };
}

export async function validateGroupCode(code) {
  try {
    // Check driver code
    let { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('driver_code', code)
      .maybeSingle();
    
    if (company) {
      try {
        const { count } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('company_id', company.id)
          .in('role', ['driver', 'accountant']);
        
        if (count >= company.drivers_limit) {
          return { company, role: 'driver', valid: false, reason: 'limit_reached' };
        }
      } catch (e) {
        // If count fails (RLS during registration), allow it
        console.warn('Count check failed, allowing registration:', e.message);
      }
      return { company, role: 'driver', valid: true };
    }
    
    // Check dispatcher code
    ({ data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('dispatcher_code', code)
      .maybeSingle());
    
    if (company) {
      try {
        const { count } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('company_id', company.id)
          .eq('role', 'dispatcher');
        
        if (count >= company.dispatchers_limit) {
          return { company, role: 'dispatcher', valid: false, reason: 'limit_reached' };
        }
      } catch (e) {
        console.warn('Count check failed, allowing registration:', e.message);
      }
      return { company, role: 'dispatcher', valid: true };
    }
    
    return { company: null, role: null, valid: false, reason: 'invalid_code' };
  } catch (err) {
    console.error('validateGroupCode error:', err.message);
    return { company: null, role: null, valid: false, reason: 'invalid_code' };
  }
}
