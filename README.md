
# Welcome to WashWise!

This is an [Expo](https://expo.dev) mobile app created using [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).  
The project is developed by **Guo Chen** and **Ziyi Xie**, aiming to improve the current digital laundry services in NUS dormitories.

---

## App Overview

A Mobile App Aiming to Improve the Current Digital Laundry Services at NUS Dormitories

---

## Project Structure

```
washwise-ms1/
├── frontend/
│   ├── assets/         # Images and fonts
│   ├── components/     # Reusable UI elements
│   ├── config/         # Firebase + Cloudinary config
│   ├── screens/        # Main app pages
│   └── utils/          # Helper functions (e.g., formatting time, validation)
├── scripts/            # Development scripts
├── node_modules/       # Installed packages
├── package.json
├── README.md
└── .gitignore, tsconfig.json, etc.

```

---

## Features

- **Real-time Machine Status** - Live availability tracking for washers/dryers
- **Smart Session Management** - Auto-countdown timers with `endTime` logic
- **Multi-stage Notifications** - Alerts `before`, `at`, and `after` cycle completion
- **Rewards Ecosystem** - Earn points for timely collection; redeem prizes
- **Community Hub** - Photo-enabled posts, comments, and chat
- **Maintenance Reporting** - Issue ticketing for machine problems
- **User Analytics** - Personal laundry statistics dashboard
- **Cloud Media** - Image hosting via `Cloudinary`
- **Accessible UI** - High-contrast design with intuitive navigation

---

## Get Started

To deploy and test the WashWise app locally, follow these steps:

### 1. Install Node.js

Visit the [Node.js official website](https://nodejs.org/) and download the latest version.

During the installation process, make sure to check the option **"Add to PATH"**.

### 2. Clone the Repository

```bash
git clone https://github.com/chenguo3125/WashWise-ms1
cd WashWise-ms1
```

### 3. Install Dependencies

```bash
npm install
```

If `npm` is not working, modify the execution policy for the current user to `RemoteSigned`.

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 4. Start the App

```bash
npx expo start
```

This will launch the Expo development server. You can open the app in a:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) – scan the QR code shown in the terminal

---

## Test Key Flows

Validate these core functionalities:

1. **Auth & Registration**  
   Firebase email/password authentication
   
2. **Laundry Session Lifecycle**  
   - Start: Select machine & time → auto-deduct → timer begins  
   - Collect: Press "Collect" → earn 0–50 points (punctuality-based)  

3. **Rewards System**  
   Browse and redeem items → points deducted  

4. **Community Hub**  
   - Create posts: Choose category + attach images → auto-tagged  
   - Engage: Real-time comments with image attachments  

5. **Operations**  
   - Deposit: Add funds to enable sessions  
   - Report: Submit machine maintenance tickets  
   - Analytics: View/share personal laundry stats

---

## Contributors

- Guo Chen
- Ziyi Xie

---

## License

MIT – feel free to use, contribute, and adapt with credit.

---

Enjoy building and testing WashWise!