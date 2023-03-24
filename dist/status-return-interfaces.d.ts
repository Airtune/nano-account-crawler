export interface IErrorReturn {
    status: "error";
    error_type: string;
    message: string;
}
export interface IOkReturn<T> {
    status: "ok";
    value?: T;
}
export type IStatusReturn<T> = IOkReturn<T> | IErrorReturn;
