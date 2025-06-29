
# Welcome to WashWise

This is an [Expo](https://expo.dev) mobile app created using [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).  
The project is developed by **Guo Chen** and **Ziyi Xie**, aiming to improve the current digital laundry services in NUS dormitories.

---

## 🚀 Features

- 🔄 **Real-time Machine Status** – View up-to-date availability of washing and drying machines
- ⏰ **Machine-based Timers** – Start sessions with automatic countdown using `endTime` logic
- 🔔 **Push Notifications** – Get reminders *before*, *on*, and *after* laundry cycle completion
- 🎯 **Points & Rewards System** – Earn points for punctual collection; redeem for prizes
- 💬 **Community & Chat** – Post, comment, and attach photos to communicate with dorm mates
- 📸 **Cloud-based Image Hosting** – All post images are uploaded and managed via Cloudinary
- 📱 **Responsive UI** – Intuitive design with bold contrast, action-driven buttons, and logical page grouping

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

## App Overview

You can begin development and testing by editing files inside the `frontend/screens` directory.

### Key Screens:

- `HomeScreen.js` – main dashboard
- `LoginScreen.js` and `RegisterScreen.js` – Firebase authentication
- `MachinesFullList.js` – real-time machine status
- `MyLaundry.js` – user's active laundry sessions
- `RewardsScreen.js` – points & incentives
- `MyRewards.js` – points & incentives
- `Community.js` – feedback & nudges
- `NewPost.js` – create new post
- `ChatScreen.js` – live chat & discussion
- `DepositScreen.js` – top up balance

---

## Test the App

You can now test these key user flows:

1. **Login/Register**: Firebase email/password authentication
2. **Start Session**: Pick a machine + time, auto-deduct credit, timer starts
3. **Collect Laundry**: Press "Collect" → receive 0–50 pts depending on punctuality
4. **Check Rewards**: View or redeem items, see points deducted
5. **Post to Community**: Select category, attach image, submit → auto-tag and color-coded
6. **Chat on Posts**: Real-time replies with optional image attachments
7. **Deposit Funds**: Top up balance to enable session starts

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

## Contributors

- Guo Chen
- Ziyi Xie

---

## License

MIT – feel free to use, contribute, and adapt with credit.

---

Enjoy building and testing WashWise!
