import * as WebSocket from "ws";

export abstract class MessageServer<T> {
  constructor(private readonly wsServer: WebSocket.Server) {
    this.wsServer.on("connection", this.subscribeToMessages);
    this.wsServer.on("error", this.cleanupDeadClients);
  }

  protected abstract handleMessage(sender: WebSocket, message: T): void;

  protected readonly subscribeToMessages = (ws: WebSocket): void => {
    ws.on("message", (data: WebSocket.Data) => {
      if (typeof data.toString() === 'string') {
        this.handleMessage(ws, JSON.parse(data.toString()));
      } else {
        console.log(data.toString())
        console.log("Received data of unsupported type.");
      }
    });
  };

  private readonly cleanupDeadClients = (): void => {
    this.wsServer.clients.forEach((client) => {
      if (this.isDead(client)) {
        this.wsServer.clients.delete(client);
      }
    });
  };

  protected broadcastExcept(
    currentClient: WebSocket,
    message: Readonly<T>
  ): void {
    this.wsServer.clients.forEach((client) => {
      if (!this.isDead(client) && client !== currentClient) {
        client.send(JSON.stringify(message));
      }
    });
  }

  protected replyTo = (client: WebSocket, message: Readonly<T>): void => {
    client.send(JSON.stringify(message));
  };

  protected get clients(): Set<WebSocket> {
    return this.wsServer.clients;
  }

  private isDead(client: WebSocket): boolean {
    return (
      client.readyState === WebSocket.CLOSING ||
      client.readyState === WebSocket.CLOSED
    );
  }
}
