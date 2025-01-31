import { NostrLink, RequestBuilder, NoteCollection } from "@snort/system";
import { useReactions, useRequestBuilder } from "@snort/system-react";
import { unixNow } from "@snort/shared";
import { useMemo } from "react";
import { LIVE_STREAM_CHAT, WEEK } from "const";

export function useLiveChatFeed(link?: NostrLink, eZaps?: Array<string>, limit = 100) {
  const since = useMemo(() => unixNow() - WEEK, [link?.id]);
  const sub = useMemo(() => {
    if (!link) return null;
    const rb = new RequestBuilder(`live:${link.id}:${link.author}`);
    rb.withOptions({
      leaveOpen: true,
    });
    const aTag = `${link.kind}:${link.author}:${link.id}`;
    rb.withFilter().kinds([LIVE_STREAM_CHAT]).tag("a", [aTag]).limit(limit);
    return rb;
  }, [link?.id, since, eZaps]);

  const feed = useRequestBuilder(NoteCollection, sub);

  const messages = useMemo(() => {
    return (feed.data ?? []).filter(ev => ev.kind === LIVE_STREAM_CHAT);
  }, [feed.data]);

  const reactions = useReactions(
    `live:${link?.id}:${link?.author}:reactions`,
    messages.map(a => NostrLink.fromEvent(a)).concat(link ? [link] : []),
    undefined,
    true
  );
  return { messages, reactions: reactions.data ?? [] };
}
