'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

interface CreateTechnicianData {
    firstName: string
    lastName: string
    email: string
    phone: string
    specialties: string
}

export async function createTechnician(data: CreateTechnicianData) {
    try {
        const { firstName, lastName, email: providedEmail, phone, specialties } = data
        const specialtiesArray = specialties.split(',').map(s => s.trim()).filter(Boolean)

        // Auto-generate email if not provided
        const email = providedEmail || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mjchauffage.com`

        // 1. Check if user exists in Auth
        // We can try to create; if it fails with "User already registered", we fetch.
        // Or we can list users by email.

        let userId: string | null = null
        let isNewUser = false

        // Try to create user first
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: 'Technician123!', // Default password
            email_confirm: true,
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                phone: phone
            }
        })

        if (createError) {
            // If error is "User already registered", find the user
            if (createError.message.includes('already registered') || createError.status === 422) {
                // Fetch existing user
                // Note: listUsers is not ideal for single lookup but works
                const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
                if (listError) throw listError

                const existingUser = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
                if (!existingUser) {
                    throw new Error('User registered but could not be found.')
                }
                userId = existingUser.id
            } else {
                throw createError
            }
        } else {
            userId = newUser.user.id
            isNewUser = true
        }

        if (!userId) throw new Error('Failed to resolve User ID')

        // 2. Update or Insert into public.users
        // Ensure role is TECHNICIAN
        const { error: profileError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: userId,
                email,
                first_name: firstName,
                last_name: lastName,
                // phone: phone, // Removed to avoid schema error
                role: 'TECHNICIAN',
                is_active: true
            })

        if (profileError) throw profileError

        // 3. Insert into technicians table
        const { error: techError } = await supabaseAdmin
            .from('technicians')
            .insert({
                user_id: userId,
                specialties: specialtiesArray,
                status: 'active'
            })

        if (techError) throw techError

        revalidatePath('/admin/technicians')

        return {
            success: true,
            message: isNewUser
                ? 'Technician created successfully. Default password: Technician123!'
                : 'Existing user promoted to Technician successfully.'
        }

    } catch (error: any) {
        console.error('Create Technician Error:', error)
        return { success: false, message: error.message }
    }
}
