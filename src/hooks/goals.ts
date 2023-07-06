import { useMemo } from "react";
import {
  RequestBuilder,
  NoteCollection,
  NostrEvent,
  EventKind,
  NostrLink,
} from "@snort/system";
import { useRequestBuilder } from "@snort/system-react";
import { GOAL } from "const";
import { System } from "index";
import { findTag } from "utils";

export function useZapGoal(link: NostrLink, leaveOpen = false) {
  const sub = useMemo(() => {
    const b = new RequestBuilder(`goals:${link.author!.slice(0, 12)}`);
    b.withOptions({ leaveOpen });
    b.withFilter()
      .kinds([GOAL])
      .tag("a", [`${link.kind}:${link.author!}:${link.id}`]);
    return b;
  }, [link]);

  const { data } = useRequestBuilder<NoteCollection>(
    System,
    NoteCollection,
    sub
  );

  const sorted = useMemo(() => {
    const s = (data ? [...data] : []).sort(
      (a: NostrEvent, b: NostrEvent) => b.created_at - a.created_at
    );
    return s;
  }, [data]);

  return sorted.at(0);
}
