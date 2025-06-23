export default class NetworkError extends Error {
  public status?: number;
  public response?: unknown;

  constructor(message: string, status?: number, response?: unknown) {
    super(message);
    this.name = "NetworkError";
    this.status = status;
    this.response = response;
  }
}
