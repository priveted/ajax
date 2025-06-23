export default class HttpError extends Error {
  public status?: number;
  public response?: unknown;

  constructor(message: string, status?: number, response?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.response = response;
  }
}
