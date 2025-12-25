declare module '@clerk/clerk-expo' {
  import * as React from 'react';

  export const ClerkProvider: React.ComponentType<any>;
  export const SignedIn: React.ComponentType<any>;
  export const SignedOut: React.ComponentType<any>;

  export function useAuth(): any;
  export function useUser(): any;
  export function useSignIn(): any;
  export function useSignUp(): any;
}

declare module '@clerk/clerk-expo/token-cache' {
  export const tokenCache: any;
}
