import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';

const ADMIN_GROUP = 'Admin';

export const useIsAppAdmin = () => {
  const [isAppAdmin, setIsAppAdmin] = useState(false);

  useEffect(() => {
    Auth.currentSession()
      .then((session) => {
        const payload = session.getAccessToken().decodePayload();
        const groups: string[] = payload['cognito:groups'] || [];
        setIsAppAdmin(groups.includes(ADMIN_GROUP));
      })
      .catch(() => setIsAppAdmin(false));
  }, []);

  return isAppAdmin;
};
