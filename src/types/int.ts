import {AxelTypeError} from "../err";
import {newtype} from "../foundation/newtype";

export type int = newtype<"int", number>;
export namespace int {
   export const typename = "int";
   export function assert(u: unknown): asserts u is int {
      if (Number.isInteger(u)) {}
      else {
         throw new AxelTypeError(
            "Value was not integer :Cults:",
            `Instead it was ${u}`,
            `with type ${typeof u}`,
         );
      }
   }
	export function from_str(s: string): int {
		const i = parseInt(s, 10);
		assert(i);
		return i;
	}
}
