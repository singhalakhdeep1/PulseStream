// ─── @feedflow/ui ─────────────────────────────────────────────────────────────
// Shared design system — consumed by all MFEs and the shell.
// Module Federation shares this module so only ONE copy loads in the browser.

export { cn } from "./utils";
export { Button, buttonVariants } from "./components/button";
export { Avatar, AvatarImage, AvatarFallback } from "./components/avatar";
export { Badge } from "./components/badge";
export { Card, CardContent, CardHeader, CardFooter } from "./components/card";
export { Spinner } from "./components/spinner";
export { Toast, ToastProvider, useToast } from "./components/toast";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/tooltip";
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./components/dialog";
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./components/dropdown-menu";
export { UserAvatar } from "./components/user-avatar";
export { PostCard } from "./components/post-card";
export { EmptyState } from "./components/empty-state";
export { LoadingSkeleton } from "./components/loading-skeleton";
