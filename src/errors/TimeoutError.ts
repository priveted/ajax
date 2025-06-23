export default class TimeoutError extends Error {
  public status?: number;
  public response?: unknown;

  constructor(message: string, status?: number, response?: unknown) {
    super(message);
    this.name = "TimeoutError";
    this.status = status;
    this.response = response;
  }
}
