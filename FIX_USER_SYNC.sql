-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, first_name, last_name, role, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name', -- Try to get name from metadata
    '', -- Last name might need to be parsed or left empty
    'CUSTOMER',
    true,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into public.customers
  INSERT INTO public.customers (user_id, email, first_name, last_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    '',
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users from auth.users to public.users and public.customers
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT * FROM auth.users LOOP
    -- Insert into public.users if not exists
    INSERT INTO public.users (id, email, first_name, last_name, role, is_active, created_at, updated_at)
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name', ''),
      '',
      'CUSTOMER',
      true,
      user_record.created_at,
      user_record.updated_at
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert into public.customers if not exists
    INSERT INTO public.customers (user_id, email, first_name, last_name, created_at, updated_at)
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name', ''),
      '',
      user_record.created_at,
      user_record.updated_at
    )
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END;
$$;
