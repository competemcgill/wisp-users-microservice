export const validHttpMethod = (method: string): boolean => {
    const httpMethods = ["POST", "GET", "PUT", "PATCH", "DELETE"];
    return httpMethods.includes(method.toUpperCase());
};
