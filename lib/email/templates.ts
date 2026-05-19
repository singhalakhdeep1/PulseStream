export function welcomeEmail({ username, loginUrl }: { username: string; loginUrl: string }) {
    return {
        subject: `Welcome to FeedFlow, @${username}! 🎉`,
        html: `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #333;">
    <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Welcome to FeedFlow 👋</h1>
    <p style="color: #a3a3a3; margin-bottom: 24px;">Your account <strong style="color: #e5e5e5;">@${username}</strong> is ready.</p>
    <a href="${loginUrl}" style="display: inline-block; background: #7c3aed; color: white; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px;">
      Get Started →
    </a>
    <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;" />
    <p style="font-size: 12px; color: #737373;">You're receiving this because you signed up at FeedFlow. <a href="#" style="color: #7c3aed;">Unsubscribe</a></p>
  </div>
</body>
</html>`,
        text: `Welcome to FeedFlow, @${username}! Get started: ${loginUrl}`,
    };
}

export function followNotificationEmail({ recipientUsername, followerUsername }: { recipientUsername: string; followerUsername: string }) {
    return {
        subject: `@${followerUsername} started following you on FeedFlow`,
        html: `<p>Hi @${recipientUsername}, <strong>@${followerUsername}</strong> just followed you on FeedFlow!</p>`,
        text: `Hi @${recipientUsername}, @${followerUsername} just followed you on FeedFlow!`,
    };
}
