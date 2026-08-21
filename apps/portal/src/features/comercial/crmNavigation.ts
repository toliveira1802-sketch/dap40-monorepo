export function buildInboxConversationPath(conversationId: string) {
  const search = new URLSearchParams({ conversationId });
  return `/comercial/inbox?${search.toString()}`;
}

export function buildPipelineOpportunityPath(opportunityId: string) {
  const search = new URLSearchParams({ opportunityId });
  return `/comercial/pipeline?${search.toString()}`;
}
