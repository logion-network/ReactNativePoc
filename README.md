# React Native POC

The purpose of this project is to demonstrate the integration of a React Native app with the Logion platform.

# Setting up Logion in a new React Native project

1. Add `@logion/client-react-native-fs` and `buffer` dependencies (e.g. `yarn add @logion/client-react-native-fs buffer`)
2. Setup `buffer`: add `global.Buffer = Buffer;` to `App.tsx`
3. Setup `react-native-fs`: see [instructions](https://github.com/itinance/react-native-fs)
4. Use the Logion SDK: see [`App.tsx`](./App.tsx) (in particular, `connect` and `addFile` callbacks)

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 0: configure your access to Logion

If not done yet, copy [`config.ts.sample`](./config.ts.sample) to `config.ts` and change the variables to match your setup.

**Never commit `config.ts` (it is gitignored) as it contains the seed of an account.**

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.
