import { useMastraClient } from "@mastra/react";
import { useQuery } from "@tanstack/react-query";

export const useAgent = (agentId?: string) => {
  const client = useMastraClient();

  return useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => (agentId ? client.getAgent(agentId).details() : null),
    retry: false,
    enabled: Boolean(agentId),
  });
};
