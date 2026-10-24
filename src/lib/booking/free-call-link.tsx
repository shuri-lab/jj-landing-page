import { useEffect, useState, type ReactNode } from "react";
import { trackFcCtaClicked, type FcCtaLocation } from "@/lib/analytics/free-call";
import { FREE_CALL_PATH } from "./config";
import { freeCallHref } from "./free-call-href";

/**
 * A link to the free-call page. The first paint is `/free-call`; after mount
 * the current query string is added. That avoids a server/client mismatch.
 */
export function FreeCallLink({
  location,
  className,
  children,
}: {
  location: FcCtaLocation;
  className?: string;
  children: ReactNode;
}) {
  const [href, setHref] = useState(FREE_CALL_PATH);
  useEffect(() => {
    setHref(freeCallHref(window.location.search));
  }, []);
  return (
    <a href={href} className={className} onClick={() => trackFcCtaClicked(location)}>
      {children}
    </a>
  );
}
