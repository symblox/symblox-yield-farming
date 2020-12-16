import env from "./env";
import getPools from "./pools";
import tokens from "./tokens";

export default env;
export const pools = getPools();
export const tokensName = tokens;
