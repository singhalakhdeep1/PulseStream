// Type stubs for Module Federation remote imports.
// The actual implementations live in each MFE app.
// These stubs let the shell type-check without build-time coupling.

declare module "feed_mfe/FeedPage" {
    import type { FeedAlgorithm } from "@feedflow/types";
    const FeedPage: React.ComponentType<{ algorithm?: FeedAlgorithm }>;
    export default FeedPage;
}

declare module "feed_mfe/CreatePostModal" {
    const CreatePostModal: React.ComponentType<{ open: boolean; onClose: () => void }>;
    export default CreatePostModal;
}

declare module "feed_mfe/FeedWidget" {
    const FeedWidget: React.ComponentType<{ limit?: number }>;
    export default FeedWidget;
}

declare module "messages_mfe/MessagesPage" {
    const MessagesPage: React.ComponentType;
    export default MessagesPage;
}

declare module "messages_mfe/ConversationView" {
    const ConversationView: React.ComponentType<{ conversationId: string }>;
    export default ConversationView;
}

declare module "messages_mfe/MessagesBadge" {
    const MessagesBadge: React.ComponentType;
    export default MessagesBadge;
}

declare module "notifications_mfe/NotificationsPage" {
    const NotificationsPage: React.ComponentType;
    export default NotificationsPage;
}

declare module "notifications_mfe/NotificationsBell" {
    const NotificationsBell: React.ComponentType;
    export default NotificationsBell;
}

declare module "notifications_mfe/NotificationsDropdown" {
    const NotificationsDropdown: React.ComponentType<{ open: boolean; onClose: () => void }>;
    export default NotificationsDropdown;
}

declare module "profile_mfe/ProfilePage" {
    const ProfilePage: React.ComponentType<{ username: string }>;
    export default ProfilePage;
}

declare module "profile_mfe/ProfileCard" {
    const ProfileCard: React.ComponentType<{ userId: string }>;
    export default ProfileCard;
}

declare module "profile_mfe/EditProfileModal" {
    const EditProfileModal: React.ComponentType<{ open: boolean; onClose: () => void }>;
    export default EditProfileModal;
}
