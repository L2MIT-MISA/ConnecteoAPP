**Documentation du dossier `src/app`**

Description générale
- **But :** Contient les écrans et routes principaux de l'application (authentification, messages, conversation, paramètres).
- **Dépendances clés :** `src/auth/session.tsx`, `src/messaging/store.tsx`, `src/components/bottom-navigation.tsx`.

Fichiers

- **`src/app/_layout.tsx`** :
  - Fournit le layout racine et les providers : `SafeAreaProvider`, `SessionProvider`, `MessagingProvider`.
  - Initialise la pile de navigation (`Stack`) avec `headerShown: false`.

- **`src/app/index.tsx`** :
  - Page d'entrée : redirige vers `/message` si l'utilisateur est connecté, sinon vers `/login`.

- **`src/app/login.tsx`** :
  - Écran de connexion.
  - Utilise `useSession()` et appelle `signIn()` puis `router.replace('/message')`.
  - Composant local `FormField` pour les champs de saisie.

- **`src/app/register.tsx`** :
  - Écran d'inscription.
  - Similaire à `login.tsx` : collecte nom, email, mot de passe, confirme et appelle `signIn()` puis `router.replace('/message')`.

- **`src/app/message.tsx`** :
  - Liste des conversations (écran `Messages`).
  - Utilise `useMessaging()` pour récupérer `conversations`.
  - Exporte `MessageRow` qui affiche un aperçu et navigue vers `/conversation/[conversationId]`.

- **`src/app/conversation/[conversationId].tsx`** :
  - Écran de conversation individuelle.
  - Utilise `useLocalSearchParams()` pour lire `conversationId` et `useMessaging()` pour messages.
  - Composant `MessageBubble` pour afficher chaque message (entrant/sortant).

- **`src/app/settings.tsx`** :
  - Écran principal des paramètres.
  - Composant `SettingsItem` réutilisable pour les éléments de la liste.
  - Routes internes : `/settings/account`, `/settings/notifications`, `/settings/security`.

- **`src/app/settings/account.tsx`** :
  - Écran `Mon compte` avec `AccountField` pour nom, email, téléphone.

- **`src/app/settings/notifications.tsx`** :
  - Écran `Notifications` avec `NotificationOption` (Switch) pour options utilisateur.

- **`src/app/settings/security.tsx`** :
  - Écran `Sécurité` avec champs de mot de passe et option d'authentification à deux facteurs.

Notes d'intégration
- Les données de messages/conversations sont fournies via le store `src/messaging/store.tsx` (fonctions évoquées : `setConversations`, `upsertConversation`, `setMessages`, `appendMessage`).
- L'authentification est gérée via `src/auth/session.tsx` (hook `useSession()` expose `user`, `signIn`, `signOut`).