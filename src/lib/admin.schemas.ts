import { z } from "zod";

export const MarqueeDirectionSchema = z.enum(["rtl", "ltr"]);

export const MarqueeSettingsSchema = z.object({
  speed: z.number().min(5).max(120),
  color: z.string(),
  direction: MarqueeDirectionSchema,
  pause_on_hover: z.boolean(),
});

export type MarqueeSettings = z.infer<typeof MarqueeSettingsSchema>;

export const ButtonSettingsSchema = z.object({
  color: z.enum(["primary", "success", "accent", "warning", "danger", "foreground"]),
  shape: z.enum(["rounded-full", "rounded-lg", "rounded-md", "rounded-none"]),
  animate: z.boolean(),
});

export type ButtonSettings = z.infer<typeof ButtonSettingsSchema>;

export const AdminActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list-announcements") }),
  z.object({ 
    action: z.literal("create-announcement"), 
    data: z.object({ title: z.string(), message: z.string() }) 
  }),
  z.object({ 
    action: z.literal("update-announcement"), 
    data: z.object({ id: z.string().uuid(), title: z.string(), message: z.string(), active: z.boolean() }) 
  }),
  z.object({ 
    action: z.literal("delete-announcement"), 
    id: z.string().uuid() 
  }),
  z.object({ action: z.literal("get-marquee") }),
  z.object({ action: z.literal("save-marquee"), data: MarqueeSettingsSchema }),
  z.object({ action: z.literal("get-button-settings") }),
  z.object({ action: z.literal("save-button-settings"), data: ButtonSettingsSchema }),
  z.object({ action: z.literal("get-metrics") }),
  z.object({ action: z.literal("list-jobs") }),
  z.object({ action: z.literal("list-tools") }),
  z.object({ 
    action: z.literal("update-tool-status"),
    id: z.string().uuid(),
    status: z.enum(["active", "maintenance"])
  }),
]);

export type MetricsResponse = {
  totalTools: number;
  activeAnnouncements: number;
  pendingVideoJobs: number;
};

export type AdminAction = z.infer<typeof AdminActionSchema>;

