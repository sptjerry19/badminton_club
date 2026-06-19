import { useLoadingStore } from "@/lib/store/loading";

export function fetchWithLoading(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  if (typeof window === "undefined") {
    return fetch(input, init);
  }

  useLoadingStore.getState().increment();
  return fetch(input, init).finally(() => {
    useLoadingStore.getState().decrement();
  });
}
