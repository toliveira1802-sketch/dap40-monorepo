-- DAP-REAL: troca de senha definitiva + sessão do casco
-- Applied via Supabase MCP apply_migration (2026-08-20)

CREATE OR REPLACE FUNCTION public.change_own_password(
  current_password text,
  new_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_hash text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  IF new_password IS NULL OR char_length(new_password) < 8 THEN
    RAISE EXCEPTION 'Senha deve ter no mínimo 8 caracteres';
  END IF;

  IF new_password !~ '[a-z]' THEN
    RAISE EXCEPTION 'Senha deve ter ao menos 1 letra minúscula';
  END IF;

  IF new_password !~ '[A-Z]' THEN
    RAISE EXCEPTION 'Senha deve ter ao menos 1 letra maiúscula';
  END IF;

  IF new_password !~ '[0-9]' THEN
    RAISE EXCEPTION 'Senha deve ter ao menos 1 número';
  END IF;

  IF new_password !~ '[^A-Za-z0-9]' THEN
    RAISE EXCEPTION 'Senha deve ter ao menos 1 caractere especial';
  END IF;

  IF new_password = '123456' THEN
    RAISE EXCEPTION 'Escolha uma senha diferente da senha inicial';
  END IF;

  IF new_password = current_password THEN
    RAISE EXCEPTION 'A nova senha deve ser diferente da atual';
  END IF;

  SELECT u.encrypted_password INTO v_hash
  FROM auth.users AS u
  WHERE u.id = v_uid;

  IF v_hash IS NULL OR v_hash <> extensions.crypt(current_password, v_hash) THEN
    RAISE EXCEPTION 'Senha atual incorreta';
  END IF;

  UPDATE auth.users AS u
  SET
    encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
    updated_at = timezone('utc'::text, now())
  WHERE u.id = v_uid;

  UPDATE public.profiles AS p
  SET
    must_change_password = false,
    updated_at = timezone('utc'::text, now())
  WHERE p.id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.change_own_password(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.change_own_password(text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_session()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role public.user_role;
  v_must boolean;
  v_name text;
  v_email text;
  v_systems jsonb := '{}'::jsonb;
  g_row record;
BEGIN
  IF v_uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT ur.role INTO v_role
  FROM public.user_roles AS ur
  WHERE ur.user_id = v_uid;

  SELECT p.must_change_password, p.full_name INTO v_must, v_name
  FROM public.profiles AS p
  WHERE p.id = v_uid;

  SELECT u.email INTO v_email
  FROM auth.users AS u
  WHERE u.id = v_uid;

  IF v_role = 'MASTER'::public.user_role THEN
    v_systems := jsonb_build_object(
      'ERP', 'admin',
      'CRM', 'admin',
      'PORTAL-GESTAO', 'admin',
      'PORTAL-MECANICO', 'admin',
      'PORTAL-EMPRESA', 'admin',
      'PORTAL-CLIENTE', 'admin'
    );
  ELSE
    FOR g_row IN
      SELECT g.system::text AS system, g.level::text AS level
      FROM public.access_grants AS g
      WHERE g.user_id = v_uid
        AND g.level <> 'none'::public.access_level
    LOOP
      v_systems := v_systems || jsonb_build_object(g_row.system, g_row.level);
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'id', v_uid,
    'email', v_email,
    'fullName', COALESCE(v_name, ''),
    'role', v_role,
    'mustChangePassword', COALESCE(v_must, false),
    'systems', v_systems
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_session() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_session() TO authenticated;
