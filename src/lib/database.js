// FleetOn — Database Service Layer
import { supabase } from './supabase';

// AUTH
export async function signUp({ email, password, name, role, companyId }) {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw authError;
  const { error: profileError } = await supabase.from('users').insert({ id: authData.user.id, email, name, role, company_id: companyId });
  if (profileError) throw profileError;
  return authData;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: user } = await supabase.from('users').select('*, company:companies(*)').eq('id', session.user.id).single();
  return user;
}

// COMPANY
export async function createCompany({ name, plan = 'free', driverCode, dispatcherCode }) {
  const { data, error } = await supabase.from('companies').insert({
    name, plan, driver_code: driverCode, dispatcher_code: dispatcherCode,
    drivers_limit: plan === 'free' ? 1 : plan === 'starter' ? 5 : plan === 'business' ? 30 : 999999,
    dispatchers_limit: plan === 'free' ? 1 : plan === 'starter' ? 2 : plan === 'business' ? 10 : 999999,
    cars_limit: plan === 'free' ? 1 : plan === 'starter' ? 5 : plan === 'business' ? 30 : 999999,
  }).select().single();
  if (error) throw error;
  return data;
}

// CARS
export async function getCars(companyId) {
  const { data, error } = await supabase.from('cars').select('*, current_driver:users(name, id)').eq('company_id', companyId).order('plate');
  if (error) throw error;
  return data || [];
}

export async function addCar({ plate, companyId }) {
  const { data, error } = await supabase.from('cars').insert({ plate, company_id: companyId }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCarStatus(carId, updates) {
  const { data, error } = await supabase.from('cars').update(updates).eq('id', carId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCar(carId) {
  const { error } = await supabase.from('cars').delete().eq('id', carId);
  if (error) throw error;
}

// TRIPS
export async function startTrip({ carId, driverId, startKm, startLocation, startLat, startLng }) {
  const { data, error } = await supabase.from('trips').insert({
    car_id: carId, driver_id: driverId, start_km: startKm, start_location: startLocation, start_lat: startLat, start_lng: startLng, status: 'active',
  }).select().single();
  if (error) throw error;
  return data;
}

export async function endTrip(tripId, { endKm, endLocation, endLat, endLng, odometerPhoto }) {
  const { data, error } = await supabase.from('trips').update({
    status: 'completed', end_km: endKm, end_location: endLocation, end_lat: endLat, end_lng: endLng, odometer_photo: odometerPhoto, ended_at: new Date().toISOString(),
  }).eq('id', tripId).select().single();
  if (error) throw error;
  return data;
}

export async function getTrips(companyId, { limit = 50, driverId } = {}) {
  let query = supabase.from('trips').select('*, car:cars(plate), driver:users(name)').order('started_at', { ascending: false }).limit(limit);
  if (driverId) query = query.eq('driver_id', driverId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// MAINTENANCE
export async function getMaintenanceParts(companyId) {
  const { data, error } = await supabase.from('maintenance').select('*, car:cars(plate, current_km)').eq('company_id', companyId).order('alert_km');
  if (error) throw error;
  return data || [];
}

export async function addMaintenancePart({ carId, partName, alertKm, alertDate, companyId }) {
  const { data, error } = await supabase.from('maintenance').insert({ car_id: carId, part_name: partName, alert_km: alertKm, alert_date: alertDate, company_id: companyId }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMaintenancePart(partId) {
  const { error } = await supabase.from('maintenance').delete().eq('id', partId);
  if (error) throw error;
}

// MESSAGES
export async function sendMessage({ senderId, receiverId, type, content }) {
  const { data, error } = await supabase.from('messages').insert({ sender_id: senderId, receiver_id: receiverId, type, content }).select().single();
  if (error) throw error;
  return data;
}

export async function acknowledgeMessage(messageId) {
  const { error } = await supabase.from('messages').update({ acknowledged: true }).eq('id', messageId);
  if (error) throw error;
}

export async function getMessages(userId) {
  const { data, error } = await supabase.from('messages').select('*, sender:users(name)').eq('receiver_id', userId).order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return data || [];
}

// TEAM
export async function getTeamMembers(companyId) {
  const { data, error } = await supabase.from('users').select('*').eq('company_id', companyId).order('role').order('name');
  if (error) throw error;
  return data || [];
}

export async function removeMember(userId) {
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw error;
}

// STATS
export async function getDashboardStats(companyId) {
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
}

// REALTIME
export function subscribeToCars(companyId, callback) {
  return supabase.channel(`cars:${companyId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'cars', filter: `company_id=eq.${companyId}` }, callback).subscribe();
}

export function subscribeToMessages(userId, callback) {
  return supabase.channel(`messages:${userId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, callback).subscribe();
}

export function subscribeToTrips(companyId, callback) {
  return supabase.channel(`trips:${companyId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, callback).subscribe();
}
