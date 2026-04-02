// FleetOn — Database Service Layer (with error handling)
import { supabase } from './supabase';

// Generic error handler
function handleError(error, context = '') {
  const msg = error?.message || error?.error_description || String(error);
  console.error(`[FleetOn DB Error${context ? ' - ' + context : ''}]:`, msg);
  
  // User-friendly messages
  if (msg.includes('Invalid login credentials')) {
    throw new Error('Invalid email or password. Please try again.');
  }
  if (msg.includes('User already registered') || msg.includes('user_already_exists')) {
    throw new Error('This email is already registered. Please login instead.');
  }
  if (msg.includes('Row Level Security') || msg.includes('new row violates row-level security')) {
    throw new Error('Permission denied. Please try logging out and back in.');
  }
  if (msg.includes('Failed to fetch') || msg.includes('Network request failed') || msg.includes('TypeError: Network')) {
    throw new Error('Network error. Please check your internet connection.');
  }
  if (msg.includes('JWT expired') || msg.includes('Invalid JWT')) {
    throw new Error('Session expired. Please login again.');
  }
  if (msg.includes('duplicate key')) {
    throw new Error('This record already exists.');
  }
  
  throw new Error(msg);
}

// AUTH
export async function signUp({ email, password, name, role, companyId }) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, password,
      options: {
        data: { name, role } // Store metadata in auth
      }
    });
    if (authError) throw authError;
    
    // Insert user profile
    const { error: profileError } = await supabase.from('users').insert({ 
      id: authData.user.id, 
      email, 
      name, 
      role, 
      company_id: companyId 
    });
    if (profileError) throw profileError;
    
    return authData;
  } catch (err) {
    handleError(err, 'signUp');
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  } catch (err) {
    handleError(err, 'signIn');
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    handleError(err, 'signOut');
  }
}

export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*, company:companies(*)')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.error('getCurrentUser error:', error.message);
      return null;
    }
    return user;
  } catch (err) {
    console.error('getCurrentUser error:', err.message);
    return null;
  }
}

// COMPANY
export async function createCompany({ name, plan = 'free', driverCode, dispatcherCode }) {
  try {
    const { data, error } = await supabase.from('companies').insert({
      name, 
      plan, 
      driver_code: driverCode, 
      dispatcher_code: dispatcherCode,
      drivers_limit: plan === 'free' ? 1 : plan === 'starter' ? 5 : plan === 'business' ? 30 : 999999,
      dispatchers_limit: plan === 'free' ? 1 : plan === 'starter' ? 2 : plan === 'business' ? 10 : 999999,
      cars_limit: plan === 'free' ? 1 : plan === 'starter' ? 5 : plan === 'business' ? 30 : 999999,
    }).select().single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    handleError(err, 'createCompany');
  }
}

// CARS
export async function getCars(companyId) {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*, current_driver:users(name, id)')
      .eq('company_id', companyId)
      .order('plate');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getCars error:', err.message);
    return [];
  }
}

export async function addCar({ plate, companyId }) {
  try {
    const { data, error } = await supabase
      .from('cars')
      .insert({ plate, company_id: companyId })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    handleError(err, 'addCar');
  }
}

export async function updateCar(carId, updates) {
  try {
    const { data, error } = await supabase
      .from('cars')
      .update(updates)
      .eq('id', carId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    handleError(err, 'updateCar');
  }
}

export async function updateCarStatus(carId, updates) {
  return updateCar(carId, updates);
}

export async function deleteCar(carId) {
  try {
    const { error } = await supabase.from('cars').delete().eq('id', carId);
    if (error) throw error;
  } catch (err) {
    handleError(err, 'deleteCar');
  }
}

// TRIPS
export async function startTrip({ carId, driverId, startKm, startLocation, startLat, startLng }) {
  try {
    // Start trip
    const { data: trip, error: tripError } = await supabase.from('trips').insert({
      car_id: carId, 
      driver_id: driverId, 
      start_km: startKm, 
      start_location: startLocation, 
      start_lat: startLat, 
      start_lng: startLng, 
      status: 'active',
    }).select().single();
    if (tripError) throw tripError;
    
    // Update car status
    const { error: carError } = await supabase
      .from('cars')
      .update({ 
        status: 'busy', 
        current_driver_id: driverId,
        last_lat: startLat,
        last_lng: startLng,
        last_location: startLocation,
      })
      .eq('id', carId);
    if (carError) throw carError;
    
    return trip;
  } catch (err) {
    handleError(err, 'startTrip');
  }
}

export async function endTrip(tripId, { endKm, endLocation, endLat, endLng, odometerPhoto, carId }) {
  try {
    // End trip
    const { data: trip, error: tripError } = await supabase.from('trips').update({
      status: 'completed', 
      end_km: endKm, 
      end_location: endLocation, 
      end_lat: endLat, 
      end_lng: endLng, 
      odometer_photo: odometerPhoto, 
      ended_at: new Date().toISOString(),
    }).eq('id', tripId).select().single();
    if (tripError) throw tripError;
    
    // Update car: set available, update km, clear driver
    if (carId) {
      const { error: carError } = await supabase
        .from('cars')
        .update({ 
          status: 'available', 
          current_driver_id: null,
          current_km: endKm,
          last_lat: endLat,
          last_lng: endLng,
          last_location: endLocation,
        })
        .eq('id', carId);
      if (carError) throw carError;
    }
    
    return trip;
  } catch (err) {
    handleError(err, 'endTrip');
  }
}

export async function getTrips(companyId, { limit = 50, driverId } = {}) {
  try {
    let query = supabase
      .from('trips')
      .select('*, car:cars(plate, company_id), driver:users(name)')
      .order('started_at', { ascending: false })
      .limit(limit);
    
    if (driverId) query = query.eq('driver_id', driverId);
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Filter by company through car relationship
    return (data || []).filter(t => t.car?.company_id === companyId || !companyId);
  } catch (err) {
    console.error('getTrips error:', err.message);
    return [];
  }
}

// MAINTENANCE
export async function getMaintenanceParts(companyId) {
  try {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*, car:cars(plate, current_km)')
      .eq('company_id', companyId)
      .order('alert_km');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getMaintenanceParts error:', err.message);
    return [];
  }
}

export async function addMaintenancePart({ carId, partName, alertKm, alertDate, companyId }) {
  try {
    const { data, error } = await supabase
      .from('maintenance')
      .insert({ 
        car_id: carId, 
        part_name: partName, 
        alert_km: alertKm, 
        alert_date: alertDate, 
        company_id: companyId 
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    handleError(err, 'addMaintenancePart');
  }
}

export async function deleteMaintenancePart(partId) {
  try {
    const { error } = await supabase.from('maintenance').delete().eq('id', partId);
    if (error) throw error;
  } catch (err) {
    handleError(err, 'deleteMaintenancePart');
  }
}

// MESSAGES
export async function sendMessage({ senderId, receiverId, type, content }) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: senderId, receiver_id: receiverId, type, content })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    handleError(err, 'sendMessage');
  }
}

export async function acknowledgeMessage(messageId) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ acknowledged: true, is_read: true })
      .eq('id', messageId);
    if (error) throw error;
  } catch (err) {
    handleError(err, 'acknowledgeMessage');
  }
}

export async function getMessages(userId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users(name)')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getMessages error:', err.message);
    return [];
  }
}

// TEAM
export async function getTeamMembers(companyId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('role')
      .order('name');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getTeamMembers error:', err.message);
    return [];
  }
}

export async function removeMember(userId) {
  try {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
  } catch (err) {
    handleError(err, 'removeMember');
  }
}

// STATS
export async function getDashboardStats(companyId) {
  try {
    const [carsRes, tripsRes, activeTripsRes] = await Promise.all([
      supabase.from('cars').select('id, status', { count: 'exact' }).eq('company_id', companyId),
      supabase.from('trips').select('id', { count: 'exact' }).eq('status', 'completed'),
      supabase.from('trips').select('id', { count: 'exact' }).eq('status', 'active'),
    ]);
    
    return {
      totalCars: carsRes.count || 0,
      activeCars: carsRes.data?.filter(c => c.status === 'busy').length || 0,
      availableCars: carsRes.data?.filter(c => c.status === 'available').length || 0,
      totalTrips: tripsRes.count || 0,
      activeTrips: activeTripsRes.count || 0,
    };
  } catch (err) {
    console.error('getDashboardStats error:', err.message);
    return { totalCars: 0, activeCars: 0, availableCars: 0, totalTrips: 0, activeTrips: 0 };
  }
}

// REALTIME
export function subscribeToCars(companyId, callback) {
  return supabase
    .channel(`cars:${companyId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'cars', filter: `company_id=eq.${companyId}` }, 
      callback
    )
    .subscribe();
}

export function subscribeToMessages(userId, callback) {
  return supabase
    .channel(`messages:${userId}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, 
      callback
    )
    .subscribe();
}

export function subscribeToTrips(companyId, callback) {
  return supabase
    .channel(`trips:${companyId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'trips' }, 
      callback
    )
    .subscribe();
}
