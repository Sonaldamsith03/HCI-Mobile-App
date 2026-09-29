# AgriConnect 🌾

Connecting farmers directly to buyers to ensure fairer pricing, featuring admin oversight, direct chat, price transparency, and offline sync.

Built with **Expo + React Native (TypeScript)**.

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js (v18 or LTS recommended)](https://nodejs.org)
- [Expo Go](https://expo.dev/go) app on your mobile device (iOS/Android) or Android Studio emulator.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npx expo start
```
- **Mobile (iOS/Android)**: Scan the QR code displayed in the terminal with the **Expo Go** app or Camera app (iOS).
- **Android Emulator**: Press <kbd>a</kbd> in the terminal.
- **Web Browser**: Press <kbd>w</kbd> in the terminal.

---

## 📱 Features & Portals

1. **Role Selection Onboarding**:
   - Deep forest canopy showcasing guaranteed 100% direct trade metrics (0% middleman cut, +55% grower margin, 24-hr harvest freshness).
   - Easy routing to **Farmer Hub** or **Buyer Marketplace**.
   - Discreet staff portal access via 4-digit PIN (`1984`).

2. **Farmer Hub**:
   - **My Crops**: Manage fresh harvest listings, set direct prices, compare middleman retail markups, toggle organic certification, edit and remove crops.
   - **Orders & Fulfillment**: Track incoming buyer bookings with unique tracking codes (`AGRI-XXXX-XX`), delivery destinations, and step status updates (*Confirmed* &rarr; *Packed at Farm* &rarr; *In Transit* &rarr; *Delivered*).
   - **Direct Chat**: Communicate directly with grocers and consumers without broker interference.

3. **Buyer Marketplace**:
   - **Fresh Harvests**: Live search and category filters (*Vegetables*, *Fruits*, *Grains*, *Tubers*, *Honey & Dairy*).
   - **Price Transparency**: Automatic savings benchmarks showing direct price vs conventional retail with percentage savings pills (*"Save 43% vs Retail"*).
   - **AgriPay Escrow**: Transparent booking modal calculating subtotal, fulfillment delivery method (*Direct Farm Delivery* or *Regional Agri-Hub*), and holding funds safely until harvest inspection.
   - **My Orders**: Real-time tracking and delivery information.

4. **Product Detail Screen**:
   - Deep harvest specs, farm location, freshness dates, grower contact buttons, and interactive escrow booking.

5. **Admin & Staff Oversight**:
   - Platform GMV volume, grower price advantage analytics, escrow dispute safety (100%), and database reset utilities.

---

## 📁 Workspace Architecture

```
agriconnect/
├── App.tsx                    # Root provider entry (SafeArea, AppContext, Navigator)
├── index.js                   # Expo root component registration
├── app.json                   # Expo project configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── babel.config.js            # Babel preset configuration
├── assets/                    # Static assets & icons
├── legacy-android/            # Preserved original Android Studio (Kotlin / Jetpack Compose) project
└── src/
    ├── types/                 # Domain interfaces (Produce, Transaction, Message, Roles)
    ├── theme/                 # 60-30-10 design system tokens & colors
    ├── data/                  # Initial seed data for produce, orders, and chats
    ├── context/               # Persistent offline-first state with AsyncStorage
    ├── components/            # Reusable UI (BrandMark, AgriCard, Buttons, Badges, Modals)
    ├── screens/               # RoleSelection, FarmerDashboard, BuyerDashboard, ProductDetail, AdminDashboard
    └── navigation/            # React Navigation Native Stack
```

---

## 📦 Legacy Android Native Project

The original Android Studio native Kotlin / Jetpack Compose project is safely preserved in [`legacy-android/`](./legacy-android/). You can open that folder directly in Android Studio if you ever need to reference the original native build.
