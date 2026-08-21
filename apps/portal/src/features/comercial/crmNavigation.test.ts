import { describe, expect, it } from "vitest";
import {
  buildInboxConversationPath,
  buildPipelineOpportunityPath,
} from "./crmNavigation";

describe("CRM navigation", () => {
  it("builds the canonical Inbox conversation URL", () => {
    expect(buildInboxConversationPath("conversation-1")).toBe(
      "/comercial/inbox?conversationId=conversation-1"
    );
  });

  it("builds the canonical Pipeline opportunity URL", () => {
    expect(buildPipelineOpportunityPath("opportunity-1")).toBe(
      "/comercial/pipeline?opportunityId=opportunity-1"
    );
  });

  it("encodes identifiers before adding them to the URL", () => {
    expect(buildInboxConversationPath("id with spaces")).toBe(
      "/comercial/inbox?conversationId=id+with+spaces"
    );
  });
});
