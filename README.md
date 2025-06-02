
# Welcome to WashWise

This is an [Expo](https://expo.dev) mobile app created using [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).  
The project is developed by **Guo Chen** and **Ziyi Xie**, aiming to improve the current digital laundry services in NUS dormitories.

---

## Get Started

To deploy and test the WashWise app locally, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/chenguo3125/WashWise-ms1
cd WashWise-ms1
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the App

```bash
npx expo start
```

This will launch the Expo development server. You can open the app in a:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) – scan the QR code shown in the terminal

---

## App Overview

You can begin development and testing by editing files inside the `frontend/screens` directory.

### Key Screens:

- `HomeScreen.js` – main dashboard
- `LoginScreen.js` and `RegisterScreen.js` – Firebase authentication
- `MachinesFullList.js` – real-time machine status
- `MyLaundry.js` – user's active laundry sessions
- `RewardsScreen.js` – points & incentives
- `Community.js` – feedback & nudges

---

## Test the App

You can now test these key user flows:

1. **Register** a new user
2. **Log in** using the same credentials
3. **Try**:
   - Viewing laundry status
   - Select and start a laundry session
   - Redeeming prizes and losing reward points

---

## Project Structure

```
washwise-test2/
├── app/                    # (Optional, unused if not using expo-router)
├── frontend/
│   ├── assets/             # Images and fonts
│   ├── components/         # Reusable components
│   ├── config/             # Firebase configuration
│   └── screens/            # Main screens (Login, Register, etc.)
├── scripts/                # Dev scripts
├── node_modules/           # Installed dependencies
├── README.md               # This file
├── package.json
└── .gitignore, tsconfig.json, etc.
```

---

## Contributors

- Guo Chen
- Ziyi Xie

---

## License

MIT – feel free to use, contribute, and adapt with credit.

---

Enjoy building and testing WashWise!
