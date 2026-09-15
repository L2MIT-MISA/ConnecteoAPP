# CONNECTEO

Application mobile et web construite avec Expo Router.

## Build Requirements

```bash
sudo apt install openjdk-17-jdk
sudo apt intall ninja-build
```

## Add ANDROID_HOME to PATH

```bash
echo 'export ANDROID_HOME=~/Android/Sdk' >> ~/.bashrc ## By default
echo 'export PATH=$PATH:$ANDROID_HOME' >> ~/.bashrc
source ~/.bashrc
```

## Make OpenJdk Permanent for your shell

```bash
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## Démarrer

```bash
npm install
npx expo run:android
```

L'écran d'accueil se trouve dans `src/app/index.tsx`.
