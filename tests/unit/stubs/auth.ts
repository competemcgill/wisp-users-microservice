import * as jwt from "jsonwebtoken";
import sinon from "sinon";

export const jwtStubs = () => {
    return {
        sign: sinon.stub(jwt, "sign"),
        verify: sinon.stub(jwt, "verify"),

        restore() {
            this.sign.restore();
            this.verify.restore();
        }
    };
};
