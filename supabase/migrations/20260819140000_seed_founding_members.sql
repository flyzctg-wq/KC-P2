-- 20260819140000_seed_founding_members.sql
--
-- Inserts / updates all 15 Founding Members (উদ্যোক্তা সদস্যগণ) into auth.users & public.profiles
-- Run this in your Supabase SQL Editor.

create extension if not exists "pgcrypto";

create or replace function seed_club_member(
  p_email text,
  p_password text,
  p_name text,
  p_name_bn text,
  p_phone text,
  p_block text,
  p_unit text,
  p_role text,
  p_post text,
  p_blood_group text,
  p_permissions jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_encrypted_pw text;
begin
  v_encrypted_pw := crypt(p_password, gen_salt('bf'));

  -- Look up existing auth user
  select id into v_user_id from auth.users where lower(email) = lower(p_email);

  if v_user_id is null then
    v_user_id := gen_random_uuid();
    insert into auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      role, aud
    ) values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      lower(p_email),
      v_encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', p_name, 'phone', p_phone, 'block', p_block, 'unit', p_unit, 'blood_group', p_blood_group),
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  end if;

  -- Upsert profile record
  insert into public.profiles (
    id, name, email, phone, block, unit,
    member_class, role, post, status,
    standing_council, permissions, blood_group, donor,
    earned_badges, joined_date
  ) values (
    v_user_id,
    p_name,
    lower(p_email),
    p_phone,
    p_block,
    p_unit,
    'Founding',
    p_role,
    p_post,
    'active',
    true,
    jsonb_build_object(
      'canManageMembers', coalesce((p_permissions->>'canManageMembers')::boolean, false),
      'canManageNotices', coalesce((p_permissions->>'canManageNotices')::boolean, false),
      'canManageFinancials', coalesce((p_permissions->>'canManageFinancials')::boolean, false),
      'canManageComplaints', coalesce((p_permissions->>'canManageComplaints')::boolean, false),
      'canDeleteItems', coalesce((p_permissions->>'canDeleteItems')::boolean, false),
      'formDetails', jsonb_build_object(
        'nameBn', p_name_bn,
        'pledgeAccepted', true,
        'area', 'কুঞ্জছায়া আবাসিক এলাকা',
        'wardNo', '২নং জালালাবাদ',
        'thana', 'বায়েজীদ বোস্তামী',
        'district', 'চট্টগ্রাম'
      )
    ),
    p_blood_group,
    true,
    array['b_founder'],
    '2021-03-01'::timestamptz
  )
  on conflict (id) do update set
    name = excluded.name,
    phone = excluded.phone,
    role = excluded.role,
    post = excluded.post,
    status = 'active',
    member_class = 'Founding',
    standing_council = true,
    blood_group = excluded.blood_group,
    permissions = excluded.permissions;

  return v_user_id;
end;
$$;

-- Seed all 15 Founding Members
do $$
begin
  -- 1. Zakaria Hasan (President)
  perform seed_club_member(
    'zakaria@kunjachaya.club', 'admin123',
    'Zakaria Hasan', 'জাকারিয়া হাছান', '+880 1400-601051',
    'A', 'A-01', 'admin', 'President', 'B+',
    '{"canManageMembers":true,"canManageNotices":true,"canManageFinancials":true,"canManageComplaints":true,"canDeleteItems":true}'::jsonb
  );

  -- 2. Khalid Hasan (General Secretary)
  perform seed_club_member(
    'flyzctg@gmail.com', 'admin123',
    'Khalid Hasan', 'খালিদ হাসান', '+880 1722-227207',
    'A', 'A-02', 'admin', 'General Secretary', 'A+',
    '{"canManageMembers":true,"canManageNotices":true,"canManageFinancials":true,"canManageComplaints":true,"canDeleteItems":true}'::jsonb
  );

  -- 3. Golam Sarwar Jony (Treasurer)
  perform seed_club_member(
    'treasurer@kunjachaya.club', 'treasurer123',
    'Golam Sarwar Jony', 'গোলাম সরোয়ার জনি', '+880 1787-268864',
    'B', 'B-01', 'admin', 'Treasurer', 'O+',
    '{"canManageMembers":false,"canManageNotices":false,"canManageFinancials":true,"canManageComplaints":false,"canDeleteItems":false}'::jsonb
  );

  -- 4. Manjur Morshed Shaheen
  perform seed_club_member(
    'shaheen@kunjachaya.club', 'member123',
    'Manjur Morshed Shaheen', 'মঞ্জুর মোর্শেদ শাহীন', '+880 1727-659454',
    'A', 'A-03', 'resident', 'Founding Member', 'A+', '{}'::jsonb
  );

  -- 5. Aminur Rahman
  perform seed_club_member(
    'aminur@kunjachaya.club', 'member123',
    'Aminur Rahman', 'আমিনুর রহমান', '+880 1813-087631',
    'A', 'A-04', 'resident', 'Founding Member', 'B+', '{}'::jsonb
  );

  -- 6. Md. Nurul Afsar
  perform seed_club_member(
    'afsar@kunjachaya.club', 'member123',
    'Md. Nurul Afsar', 'মোঃ নুরুল আফছার', '+880 1819-393949',
    'B', 'B-02', 'resident', 'Founding Member', 'O+', '{}'::jsonb
  );

  -- 7. Kafil Uddin
  perform seed_club_member(
    'kafil@kunjachaya.club', 'member123',
    'Kafil Uddin', 'কফিল উদ্দিন', '+880 1719-376603',
    'B', 'B-03', 'resident', 'Founding Member', 'AB+', '{}'::jsonb
  );

  -- 8. Azizur Rahman
  perform seed_club_member(
    'azizur@kunjachaya.club', 'member123',
    'Azizur Rahman', 'আজিজুর রহমান', '+880 1976-205506',
    'C', 'C-01', 'resident', 'Founding Member', 'O+', '{}'::jsonb
  );

  -- 9. Mehdi Hasan Babu
  perform seed_club_member(
    'mehdi@kunjachaya.club', 'member123',
    'Mehdi Hasan Babu', 'মেহেদী হাসান বাবু', '+880 1903-735545',
    'C', 'C-02', 'resident', 'Founding Member', 'B+', '{}'::jsonb
  );

  -- 10. Md. Humayungir Chowdhury
  perform seed_club_member(
    'humayun@kunjachaya.club', 'member123',
    'Md. Humayungir Chowdhury', 'মোঃ হুমায়ুনগীর চৌধুরী', '+880 1838-357274',
    'D', 'D-01', 'resident', 'Founding Member', 'A+', '{}'::jsonb
  );

  -- 11. Sourav Ahmad Chowdhury
  perform seed_club_member(
    'sourav@kunjachaya.club', 'member123',
    'Sourav Ahmad Chowdhury', 'সৌরভ আহমদ চৌধুরী', '+880 1811-883380',
    'D', 'D-02', 'resident', 'Founding Member', 'O-', '{}'::jsonb
  );

  -- 12. Jewel Khan
  perform seed_club_member(
    'jewel@kunjachaya.club', 'member123',
    'Jewel Khan', 'জুয়েল খান', '+880 1814-810197',
    'E', 'E-01', 'resident', 'Founding Member', 'B-', '{}'::jsonb
  );

  -- 13. Khaled Mahmud
  perform seed_club_member(
    'khaled@kunjachaya.club', 'member123',
    'Khaled Mahmud', 'খালেদ মাহমুদ', '+880 1711-268247',
    'E', 'E-02', 'resident', 'Founding Member', 'O+', '{}'::jsonb
  );

  -- 14. S. M. Iqbal Bahar
  perform seed_club_member(
    'iqbal@kunjachaya.club', 'member123',
    'S. M. Iqbal Bahar', 'এস. এম. ইকবাল বাহার', '+880 1911-841318',
    'E', 'E-03', 'resident', 'Founding Member', 'A-', '{}'::jsonb
  );

  -- 15. Md. Nur Nabi
  perform seed_club_member(
    'nurnabi@kunjachaya.club', 'member123',
    'Md. Nur Nabi', 'মোঃ নূর নবী', '+880 1913-330703',
    'E', 'E-04', 'resident', 'Founding Member', 'B+', '{}'::jsonb
  );
end;
$$;
