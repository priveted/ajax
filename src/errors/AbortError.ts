export default class AbortError extends Error {
  public status?: number;
  public response?: unknown;

  constructor(message: string, status?: number, response?: unknown) {
    super(message);
    this.name = "AbortError";
    this.status = status;
    this.response = response;
  }
}
