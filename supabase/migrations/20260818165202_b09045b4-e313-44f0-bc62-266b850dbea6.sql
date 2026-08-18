-- Corrigir search_path e revogar execuções de funções SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.handle_community_post_like()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_community_post_comment()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.community_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revogar execução de todos os papéis não-administrativos
REVOKE EXECUTE ON FUNCTION public.handle_community_post_like() FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.handle_community_post_comment() FROM PUBLIC, authenticated, anon;

-- Garantir que apenas o service_role ou o próprio sistema (via triggers) possa executar se necessário, 
-- embora triggers executem com as permissões do definer.
GRANT EXECUTE ON FUNCTION public.handle_community_post_like() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_community_post_comment() TO service_role;
