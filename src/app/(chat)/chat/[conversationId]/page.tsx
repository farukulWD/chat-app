import { ConversationPanel } from "@/components/chat/conversation-panel";

export default async function ConversationPage({
  params,
}: PageProps<"/chat/[conversationId]">) {
  const { conversationId } = await params;

  return <ConversationPanel conversationId={conversationId} />;
}
