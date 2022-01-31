import * as WebSocket from "ws";

export abstract class MessageServer<T> {
  constructor(private readonly wsServer: WebSocket.Server) {
    this.wsServer.on("connection", this.subscribeToMessages);
  }

  protected abstract handleMessage(sender: WebSocket, message: T): void;

  protected readonly subscribeToMessages = (ws: WebSocket): void => {
    ws.on("message", (data: WebSocket.Data) => {
      if (typeof data === "string") {
        this.handleMessage(ws, JSON.parse(data));
      } else {
        console.log("Received data of unsupported type.");
      }
    });
  };
}
