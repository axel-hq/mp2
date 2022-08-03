import {AxelTypeError, to_AxelError} from "./err";
import {object, string} from "./foundation";
import {int} from "./types/int";

type config_entry = {
   SERVER_PORT: int;
   RELATIVE_MAIN: string;
};
namespace config_entry {
   export const typename = "config_entry";
   export function assert(u: unknown): asserts u is config_entry {
      try {
         object.assert(u);
         object.assert_has_t(u, "SERVER_PORT", int);
         object.assert_has_t(u, "RELATIVE_MAIN", string);
      } catch (e) {
         throw new AxelTypeError(
            "While asserting that a value was a config_entry, encountered an error!",
            to_AxelError(e),
         );
      }
   }
}

export namespace config {
   const filename = `${__dirname}/managed.json`;
   
}
