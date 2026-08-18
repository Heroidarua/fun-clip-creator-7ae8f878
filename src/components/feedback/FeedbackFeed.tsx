import { useState, useEffect } from "react";
import { Feedback } from "@/lib/feedback/types";
import { getFeedbacks, getCategories } from "@/lib/feedback/services";
import { Category } from "@/lib/feedback/types";
import FeedbackCard from "./FeedbackCard";
import CreateFeedbackCard from "./CreateFeedbackCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@tanstack/react-router";

const FeedbackFeed = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const search = useSearch({ from: "/feedback/" }) as any;
  const currentFilter = search.filter || "recent";

  useEffect(() => {
    async function loadFeedbacks() {
      setLoading(true);
      try {
        const categorySlug = search.category;
        let categoryId = undefined;
        
        if (categorySlug) {
          const cats = await getCategories();
          categoryId = cats.find((c: Category) => c.slug === categorySlug)?.id;
        }

        const data = await getFeedbacks({
          categoryId,
          trending: currentFilter === "trending"
        });
        
        setFeedbacks(data);
      } catch (error) {
        console.error("Failed to load feedbacks", error);
      } finally {
        setLoading(false);
      }
    }
    loadFeedbacks();
  }, [currentFilter, search.category]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreateFeedbackCard onFeedbackCreated={(newFeedback) => setFeedbacks([newFeedback as unknown as Feedback, ...feedbacks])} />
      
      <div className="flex items-center justify-between border-b border-border pb-2">
         <h2 className="font-display text-xl">Últimas Publicações</h2>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <button 
            className={`${currentFilter === "recent" ? "text-primary border-b-2 border-primary" : "hover:text-foreground"} pb-1 transition-colors`}
          >
            Recentes
          </button>
          <button 
            className={`${currentFilter === "trending" ? "text-primary border-b-2 border-primary" : "hover:text-foreground"} pb-1 transition-colors`}
          >
            Populares
          </button>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">Nenhuma publicação encontrada. Seja o primeiro a feedbackar!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedbacks.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackFeed;
