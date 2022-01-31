import * as WebSocket from "ws";
import { MessageServer } from "./message-server";
import { Message, MessageTypes, UUID } from "./message";

type Replies = Map<WebSocket, Message>;

export class BlockchainServer extends MessageServer<Message> {
  private readonly receivedMessagesAwaitingResponse = new Map<
    UUID,
    WebSocket
  >();

  private readonly sentMessagesAwaitingReply = new Map<UUID, Replies>();

  protected handleMessage(sender: WebSocket, message: Message): void {
    throw new Error("Method not implemented.");
  }

  private handleLongestChainRequest(
    requestor: WebSocket,
    message: Message
  ): void {
    if (this.clients.size > 1) {
      this.receivedMessagesAwaitingResponse.set(
        message.correlationId,
        requestor
      );
      this.sentMessagesAwaitingReply.set(message.correlationId, new Map());
      this.broadcastExcept(requestor, message);
    } else {
      this.replyTo(requestor, {
        type: MessageTypes.LONGEST_CHAIN_RESPONSE,
        correlationId: message.correlationId,
        payload: [],
      });
    }
  }

  private handleLongestChainResponse(
    sender: WebSocket,
    message: Message
  ): void {
    if (this.receivedMessagesAwaitingResponse.has(message.correlationId)) {
      const requestor = this.receivedMessagesAwaitingResponse.get(
        message.correlationId
      );
      if (this.everyoneReplied(sender, message)) {
        const allReplies = this.sentMessagesAwaitingReply
          .get(message.correlationId)
          .values();
        const longestChain = Array.from(allReplies).reduce(
          this.selectTheLongestChain
        );
        this.replyTo(requestor, longestChain);
      }
    }
  }

  private handleAddTransactionsRequest(
    requestor: WebSocket,
    message: Message
  ): void {
    this.broadcastExcept(requestor, message);
  }

  private handleNewBlockAnnouncement(
    requestor: WebSocket,
    message: Message
  ): void {
    this.broadcastExcept(requestor, message);
  }

  selectTheLongestChain(
    currentlyLongest: Message,
    current: Message,
    index: number
  ) {
    return !!index && current.payload.length > currentlyLongest.payload.length
      ? current
      : currentlyLongest;
  }

  private everyoneReplied(sender: WebSocket, message: Message): boolean {
    const repliedClients = this.sentMessagesAwaitingReply
      .get(message.correlationId)
      .set(sender, message);
    const awaitingForClients = Array.from(this.clients).filter(
      (c) => !repliedClients.has(c)
    );
    return awaitingForClients.length === 1;
  }
}
