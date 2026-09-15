import { useCallback, useEffect, useState } from 'react';

export type NotificationPreferences = {
  newMessages: boolean;
  contactRequests: boolean;
  networkAlerts: boolean;
  sound: boolean;
};

export const defaultNotificationPreferences: NotificationPreferences = {
  newMessages: true,
  contactRequests: true,
  networkAlerts: false,
  sound: true,
};

export interface NotificationPreferencesRepository {
  load(userId: string): Promise<NotificationPreferences>;
  save(userId: string, preferences: NotificationPreferences): Promise<void>;
}

/** Replace this repository once the team has applied the preferences-table migration. */
export const notificationPreferencesRepository: NotificationPreferencesRepository = {
  async load() {
    return defaultNotificationPreferences;
  },
  async save() {
    // There is no verified preferences table in the current schema.
  },
};

export function useNotificationPreferences(userId: string | undefined) {
  const [preferences, setPreferences] = useState(defaultNotificationPreferences);

  useEffect(() => {
    if (!userId) {
      setPreferences(defaultNotificationPreferences);
      return;
    }

    void notificationPreferencesRepository.load(userId).then(setPreferences);
  }, [userId]);

  const setPreference = useCallback(
    (key: keyof NotificationPreferences, value: boolean) => {
      setPreferences((current) => {
        const next = { ...current, [key]: value };

        if (userId) {
          void notificationPreferencesRepository.save(userId, next);
        }

        return next;
      });
    },
    [userId]
  );

  return { preferences, setPreference };
}
