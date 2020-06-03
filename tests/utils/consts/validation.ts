export const emptyValidationError  = () => {
    return {
        isEmpty() {
            return true;
        }
    }
};

export const validationErrorWithMessage = (errorMsg: {status:number;message:string}) => {
    return {
        isEmpty() {
            return false;
        },
        formatWith() {
            return {
                array() {
                    return [errorMsg];
                }
            };
        }
    };
}