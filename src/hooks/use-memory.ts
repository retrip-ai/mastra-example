import { useMastraClient } from "@mastra/react";
import { useQuery } from "@tanstack/react-query";

export const useMemory = (agentId?: string) => {
  const client = useMastraClient();

  return useQuery({
    queryKey: ["memory", agentId],
    queryFn: () => (agentId ? client.getMemoryStatus(agentId) : null),
    enabled: Boolean(agentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
};
