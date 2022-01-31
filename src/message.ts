export type UUID = string;

export enum MessageTypes {
  LONGEST_CHAIN_REQUEST = "LONGEST_CHAIN_REQUEST",
  LONGEST_CHAIN_RESPONSE = "LONGEST_CHAIN_RESPONSE",
  NEW_BLOCK_ANNOUNCEMENT = "NEW_BLOCK_ANNOUNCEMENT",
  NEW_BLOCK_REQUEST = "NEW_BLOCK_REQUEST",
}

export interface Message {
  correlationId: UUID;
  type: string;
  payload?: any;
}
