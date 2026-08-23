-- 20260819140000_seed_founding_members.sql
--
-- Inserts / updates all 15 Founding Members (উদ্যোক্তা সদস্যগণ) into auth.users & public.profiles
-- Run this in your Supabase SQL Editor.

create extension if not exists "pgcrypto";

create or replace function seed_club_member(
  p_member_code text,
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
      jsonb_build_object('name', p_name, 'phone', p_phone, 'nameBn', p_name_bn, 'memberCode', p_member_code, 'block', p_block, 'unit', p_unit, 'blood_group', p_blood_group),
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
      'memberCode', p_member_code,
      'canManageMembers', coalesce((p_permissions->>'canManageMembers')::boolean, false),
      'canManageNotices', coalesce((p_permissions->>'canManageNotices')::boolean, false),
      'canManageFinancials', coalesce((p_permissions->>'canManageFinancials')::boolean, false),
      'canManageComplaints', coalesce((p_permissions->>'canManageComplaints')::boolean, false),
      'canDeleteItems', coalesce((p_permissions->>'canDeleteItems')::boolean, false),
      'formDetails', jsonb_build_object(
        'nameBn', p_name_bn,
        'memberCode', p_member_code,
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

-- Seed all 15 Founding Members (উদ্যোক্তা সদস্যগণ) in Order of Member Codes 001 - 015
do $$
begin
  -- 001. Manjur Morshed Shaheen
  perform seed_club_member(
    '001', 'shaheen@kunjachaya.club', 'member123',
    'Manjur Morshed Shaheen', 'মনজুর মোর্শেদ শাহীন', '01727-659454',
    'A', 'A-03', 'resident', 'Founding Member', 'A+', '{}'::jsonb
  );

  -- 002. Aminur Rahman
  perform seed_club_member(
    '002', 'aminur@kunjachaya.club', 'member123',
    'Aminur Rahman', 'আমিনুর রহমান', '01813-087631',
    'A', 'A-04', 'resident', 'Founding Member', 'B+', '{}'::jsonb
  );

  -- 003. Zakaria Hasan (President)
  perform seed_club_member(
    '003', 'zakaria@kunjachaya.club', 'admin123',
    'Zakaria Hasan', 'জাকারিয়া হাছান', '01400-601051',
    'A', 'A-01', 'admin', 'President', 'B+',
    '{"canManageMembers":true,"canManageNotices":true,"canManageFinancials":true,"canManageComplaints":true,"canDeleteItems":true}'::jsonb
  );

  -- 004. Md. Nurul Afsar
  perform seed_club_member(
    '004', 'afsar@kunjachaya.club', 'member123',
    'Md. Nurul Afsar', 'মোঃ নুরুল আফছার', '01819-393949',
    'B', 'B-02', 'resident', 'Founding Member', 'O+', '{}'::jsonb
  );

  -- 005. Kafil Uddin
  perform seed_club_member(
    '005', 'kafil@kunjachaya.club', 'member123',
    'Kafil Uddin', 'কফিল উদ্দিন', '01719-376603',
    'B', 'B-03', 'resident', 'Founding Member', 'AB+', '{}'::jsonb
  );

  -- 006. Md. Azizur Rahman
  perform seed_club_member(
    '006', 'azizur@kunjachaya.club', 'member123',
    'Md. Azizur Rahman', 'মোঃ আজিজুর রহমান', '01976-205506',
    'C', 'C-01', 'resident', 'Founding Member', 'O+', '{}'::jsonb
  );

  -- 007. Mehdi Hasan Babu
  perform seed_club_member(
    '007', 'mehdi@kunjachaya.club', 'member123',
    'Mehdi Hasan Babu', 'মেহেদী হাসান বাবু', '01903-735545',
    'C', 'C-02', 'resident', 'Founding Member', 'B+', '{}'::jsonb
  );

  -- 008. Md. Humayungir Chowdhury
  perform seed_club_member(
    '008', 'humayun@kunjachaya.club', 'member123',
    'Md. Humayungir Chowdhury', 'মোঃ হুমায়ুনগীর চৌধুরী', '01838-357274',
    'D', 'D-01', 'resident', 'Founding Member', 'A+', '{}'::jsonb
  );

  -- 009. Sourav Ahmad Chowdhury
  perform seed_club_member(
    '009', 'sourav@kunjachaya.club', 'member123',
    'Sourav Ahmad Chowdhury', 'সৌরভ আহমদ চৌধুরী', '01811-883380',
    'D', 'D-02', 'resident', 'Founding Member', 'O-', '{}'::jsonb
  );

  -- 010. Md. Mosleh Uddin Khan Jewel
  perform seed_club_member(
    '010', 'jewel@kunjachaya.club', 'member123',
    'Md. Mosleh Uddin Khan Jewel', 'মোঃ মোসলেহ্ উদ্দিন খান জুয়েল', '01814-810197',
    'E', 'E-01', 'resident', 'Founding Member', 'B-', '{}'::jsonb
  );

  -- 011. Khaled Mahmud
  perform seed_club_member(
    '011', 'khaled@kunjachaya.club', 'member123',
    'Khaled Mahmud', 'খালেদ মাহমুদ', '01711-268247',
    'E', 'E-02', 'resident', 'Founding Member', 'O+', '{}'::jsonb
  );

  -- 012. Khalid Hasan (General Secretary)
  perform seed_club_member(
    '012', 'flyzctg@gmail.com', 'admin123',
    'Khalid Hasan', 'খালিদ হাসান', '01722-227207',
    'A', 'A-02', 'admin', 'General Secretary', 'A+',
    '{"canManageMembers":true,"canManageNotices":true,"canManageFinancials":true,"canManageComplaints":true,"canDeleteItems":true}'::jsonb
  );

  -- 013. S. M. Iqbal Bahar
  perform seed_club_member(
    '013', 'iqbal@kunjachaya.club', 'member123',
    'S. M. Iqbal Bahar', 'এস. এম. ইকবাল বাহার', '01911-841318',
    'E', 'E-03', 'resident', 'Founding Member', 'A-', '{}'::jsonb
  );

  -- 014. Md. Nur Nabi
  perform seed_club_member(
    '014', 'nurnabi@kunjachaya.club', 'member123',
    'Md. Nur Nabi', 'মোঃ নূর নবী', '01913-330703',
    'E', 'E-04', 'resident', 'Founding Member', 'B+', '{}'::jsonb
  );

  -- 015. Golam Sarwar Jony (Treasurer)
  perform seed_club_member(
    '015', 'treasurer@kunjachaya.club', 'treasurer123',
    'Golam Sarwar Jony', 'গোলাম সরোয়ার জনি', '01787-268864',
    'B', 'B-01', 'admin', 'Treasurer', 'O+',
    '{"canManageMembers":false,"canManageNotices":false,"canManageFinancials":true,"canManageComplaints":false,"canDeleteItems":false}'::jsonb
  );
end;
$$;
