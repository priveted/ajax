export default class HttpError extends Error {
  public status?: number;
  public response?: unknown;
  public headers?: Record<string, string>;
  constructor(message: string, status?: number, response?: unknown, headers?: Record<string, string>) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.response = response;
    this.headers = headers;
  }
}
