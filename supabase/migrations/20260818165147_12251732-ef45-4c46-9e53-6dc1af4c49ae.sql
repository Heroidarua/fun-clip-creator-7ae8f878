ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categorias são visíveis para todos" ON public.community_categories FOR SELECT USING (true);

-- Criar funções novamente caso tenham falhado na primeira tentativa (ou garantir que existam)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir triggers
DROP TRIGGER IF EXISTS on_community_post_like ON public.community_post_likes;
CREATE TRIGGER on_community_post_like
    AFTER INSERT OR DELETE ON public.community_post_likes
    FOR EACH ROW EXECUTE FUNCTION public.handle_community_post_like();

DROP TRIGGER IF EXISTS on_community_post_comment ON public.community_comments;
CREATE TRIGGER on_community_post_comment
    AFTER INSERT OR DELETE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_community_post_comment();

-- Revogar acesso público às funções SECURITY DEFINER
REVOKE ALL ON FUNCTION public.handle_community_post_like() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_community_post_comment() FROM PUBLIC;
