import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

// Supabase auth + score tracking wired here in a future iteration
export function UserProvider({ children }) {
  const [user] = useState(null);

  const signIn = async () => {
    // TODO: supabase.auth.signInWithOAuth({ provider: 'google' })
  };

  const signOut = async () => {
    // TODO: supabase.auth.signOut()
  };

  return (
    <UserContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
