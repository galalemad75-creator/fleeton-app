# FleetOn — Fleet Management App 🚗

A complete fleet management platform with 5 roles, RTL support, and dark/light themes.

## Features

- 🚗 **Real-time GPS Tracking** — Live vehicle location on map
- 📋 **Trip Logging** — Start/end trips with location & odometer
- 🔧 **Maintenance Alerts** — KM-based alerts for parts replacement
- 💬 **Team Communication** — Text messages between dispatcher & driver
- 📊 **Reports** — Trip reports and cost analysis
- 🌍 **Multi-language** — Arabic (RTL) + English
- 🌙 **Dark/Light Theme**

## 5 Roles

| Role | Access |
|------|--------|
| 👑 Owner | Full dashboard, team management, car management, group codes |
| 🚗 Driver | Start/end trips, view available cars, receive messages |
| 📡 Dispatcher | Live map, fleet list, send messages to drivers |
| 🔧 Maintenance | Parts tracking, KM alerts, add/delete parts |
| 📊 Accountant | Trip reports, KM statistics, cost analysis |

---

## Quick Setup Guide

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"** and fill in:
   - Name: `fleeton` (or anything)
   - Database Password: (save this somewhere)
   - Region: Choose closest to your users
3. Wait for the project to be created (~1 minute)

### 2. Set Up Database

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the **entire contents** of `supabase/schema.sql` and paste it
4. Click **"Run"** ▶️
5. You should see "Success. No rows returned" — that means it worked!

### 3. Get Your API Keys

1. Go to **Settings** → **API** (left sidebar)
2. Copy these two values:
   - **Project URL** → looks like `https://xxxxxxxxxxxx.supabase.co`
   - **anon / public** key → a long string starting with `eyJ...`

### 4. Create `.env` File

In the project root folder, create a file called `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the values with YOUR actual Project URL and anon key from step 3.

### 5. Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

Then:
- Press `a` for Android
- Press `i` for iOS  
- Press `w` for Web
- Or scan the QR code with Expo Go app on your phone

---

## Building for Production

### Android APK
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile production
```

### iOS
```bash
eas build --platform ios --profile production
```

---

## Project Structure

```
fleeton-app/
├── App.js                    # Entry point with error boundary
├── src/
│   ├── components/
│   │   └── ErrorBoundary.js  # Crash protection
│   ├── constants/
│   │   └── theme.js          # Theme constants
│   ├── contexts/
│   │   └── ThemeContext.js   # Dark/light theme provider
│   ├── lib/
│   │   ├── supabase.js       # Supabase client
│   │   ├── database.js       # All database operations
│   │   ├── codeGenerator.js  # Group code generation
│   │   └── i18n.js           # Arabic/English translations
│   ├── navigation/
│   │   └── index.js          # Navigation structure
│   └── screens/
│       ├── LoginScreen.js
│       ├── RegisterScreen.js
│       ├── OwnerHomeScreen.js
│       ├── DriverHomeScreen.js
│       ├── DispatcherHomeScreen.js
│       ├── MaintenanceHomeScreen.js
│       ├── AccountantHomeScreen.js
│       ├── SettingsScreen.js
│       ├── ManageTeamScreen.js
│       ├── AddCarScreen.js
│       ├── AddPartScreen.js
│       ├── TripDetailScreen.js
│       ├── PrivacyPolicyScreen.js
│       ├── TermsOfServiceScreen.js
│       └── AboutUsScreen.js
├── supabase/
│   └── schema.sql            # Complete database schema
├── index.html                # Landing page (for GitHub Pages)
├── app.json                  # Expo config
└── eas.json                  # EAS Build config
```

## Common Issues

### ❌ "Something went wrong" / App crashes on startup
- Make sure you created the `.env` file with correct Supabase keys
- Make sure you ran the SQL schema in Supabase SQL Editor
- Check that your Supabase project is active (not paused)

### ❌ "Permission denied" errors
- The RLS policies need the SQL schema to be run
- Make sure you ran the full `schema.sql` file

### ❌ "Network error"
- Check your internet connection
- Make sure the Supabase URL is correct (no trailing slash)
- Make sure your Supabase project isn't paused

### ❌ App shows "Setup Required" screen
- The `.env` file is missing or has placeholder values
- Restart the dev server after creating/editing `.env`

---

## Tech Stack

- **Frontend:** React Native (Expo SDK 52)
- **Backend:** Supabase (Auth + Database + Realtime)
- **Database:** PostgreSQL with Row Level Security
- **Maps:** react-native-maps
- **i18n:** i18n-js + expo-localization
- **State:** React Context + Hooks

---

## License

All rights reserved. FleetOn © 2024
