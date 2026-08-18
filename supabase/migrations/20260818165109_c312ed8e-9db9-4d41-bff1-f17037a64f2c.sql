CREATE TYPE public.notification_type AS ENUM ('like', 'comment', 'follow', 'reply', 'system');

CREATE TABLE IF NOT EXISTS public.community_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT ON public.community_categories TO anon, authenticated;
GRANT ALL ON public.community_categories TO service_role;

CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    image_url TEXT,
    category_id UUID REFERENCES public.community_categories(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT ON public.community_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts são visíveis para todos" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Usuários autenticados podem criar posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem editar seus próprios posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.community_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

GRANT SELECT ON public.community_post_likes TO anon, authenticated;
GRANT INSERT, DELETE ON public.community_post_likes TO authenticated;
GRANT ALL ON public.community_post_likes TO service_role;

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curtidas são visíveis para todos" ON public.community_post_likes FOR SELECT USING (true);
CREATE POLICY "Usuários autenticados podem curtir" ON public.community_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem remover sua própria curtida" ON public.community_post_likes FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    parent_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT ON public.community_comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_comments TO authenticated;
GRANT ALL ON public.community_comments TO service_role;

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comentários são visíveis para todos" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Usuários autenticados podem comentar" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem editar seus próprios comentários" ON public.community_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios comentários" ON public.community_comments FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.community_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, following_id)
);

GRANT SELECT ON public.community_follows TO anon, authenticated;
GRANT INSERT, DELETE ON public.community_follows TO authenticated;
GRANT ALL ON public.community_follows TO service_role;

ALTER TABLE public.community_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seguidores são visíveis para todos" ON public.community_follows FOR SELECT USING (true);
CREATE POLICY "Usuários podem seguir outros" ON public.community_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Usuários podem deixar de seguir" ON public.community_follows FOR DELETE USING (auth.uid() = follower_id);

CREATE TABLE IF NOT EXISTS public.community_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, UPDATE ON public.community_notifications TO authenticated;
GRANT ALL ON public.community_notifications TO service_role;

ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias notificações" ON public.community_notifications FOR SELECT USING (auth.uid() = receiver_id);
CREATE POLICY "Usuários podem marcar suas notificações como lidas" ON public.community_notifications FOR UPDATE USING (auth.uid() = receiver_id);

CREATE TABLE IF NOT EXISTS public.community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT INSERT ON public.community_reports TO authenticated;
GRANT ALL ON public.community_reports TO service_role;

ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem denunciar" ON public.community_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE TABLE IF NOT EXISTS public.community_user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(blocker_id, blocked_id)
);

GRANT SELECT, INSERT, DELETE ON public.community_user_blocks TO authenticated;
GRANT ALL ON public.community_user_blocks TO service_role;

ALTER TABLE public.community_user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus bloqueios" ON public.community_user_blocks USING (auth.uid() = blocker_id);

INSERT INTO public.community_categories (name, slug, icon, description)
VALUES 
    ('Geral', 'geral', '💬', 'Assuntos gerais da comunidade'),
    ('Notícias', 'noticias', '📰', 'Notícias do mundo da tecnologia'),
    ('Games', 'games', '🎮', 'Tudo sobre o mundo dos jogos'),
    ('Tecnologia', 'tecnologia', '🤖', 'Inovações e gadgets'),
    ('IA', 'ia', '🧠', 'Inteligência Artificial e Futuro'),
    ('Internet', 'internet', '🌐', 'Web, redes sociais e tendências'),
    ('Celular', 'celular', '📱', 'Apps, smartphones e hardware'),
    ('SOS01', 'sos01', '🆘', 'Novidades e sugestões para o SOS01'),
    ('Dicas', 'dicas', '💡', 'Dicas úteis e tutoriais'),
    ('Humor', 'humor', '😂', 'Memes e diversão')
ON CONFLICT (slug) DO NOTHING;