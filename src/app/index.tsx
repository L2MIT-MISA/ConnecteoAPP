import { Redirect } from 'expo-router';

import { useSession } from '../auth/session';

export default function Index() {
  const { user } = useSession();

  return <Redirect href={'/map'} />;
}
