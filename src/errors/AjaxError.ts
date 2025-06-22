export default class AjaxError extends Error {
    public status?: number;
    public response?: unknown;

    constructor(message: string, status?: number, response?: unknown) {
        super(message);
        this.name = 'AjaxError';
        this.status = status;
        this.response = response;
    }
}
