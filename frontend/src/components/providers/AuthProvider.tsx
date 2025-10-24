'use client'

export function AuthProvider({ 
  children,
  session
}: {
  children: React.ReactNode
  session?: any
}) {
  // AuthProvider simplifié - NextAuth désactivé
  // Utilisation de l'API maison uniquement
  return (
    <>
      {children}
    </>
  )
}