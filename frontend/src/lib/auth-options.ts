import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    pages: {
        signIn: '/auth/login',
        error: '/auth/login',
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                try {
                    // Use direct backend URL
                    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001/api';

                    console.log('🔐 Social Login: Connecting to backend at:', backendUrl);

                    const res = await fetch(`${backendUrl}/auth/social-login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: user.email,
                            firstName: (profile as any)?.given_name || user.name?.split(' ')[0] || '',
                            lastName: (profile as any)?.family_name || user.name?.split(' ').slice(1).join(' ') || '',
                            image: user.image,
                        }),
                    });

                    if (!res.ok) {
                        const errorText = await res.text();
                        console.error('❌ Backend social login failed:', errorText);
                        return false;
                    }

                    const data = await res.json();
                    console.log('✅ Social login successful');

                    if (data.success) {
                        // Attach backend data to user object so it's available in jwt callback
                        (user as any).accessToken = data.data.accessToken;
                        (user as any).refreshToken = data.data.refreshToken;
                        (user as any).id = data.data.user.id;
                        (user as any).role = data.data.user.role;
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('❌ Social login error:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.refreshToken = (user as any).refreshToken;
                token.id = (user as any).id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).accessToken = token.accessToken;
                (session.user as any).refreshToken = token.refreshToken;
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
}
