// Import Internal Dependencies
import Operation, { OperationResult } from "./class/Operation.class";
import { PolicyCallback, none } from "./policies";

/**
 * Those options are inspired by the retry package
 * @see https://www.npmjs.com/package/retry
 */
export interface RetryOptions {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  unref?: boolean;
  factor?: number;
  forever?: boolean;
  signal?: AbortSignal | null;
}

export type RetryCallback<T> = (() => Promise<T>) | (() => T);

export async function retry<T>(
  callback: RetryCallback<T>, options: RetryOptions = {}, policy: PolicyCallback = none
): Promise<OperationResult<T>> {
  const op = new Operation<T>(options);

  do {
    try {
      const data = await callback();
      op.success(data);
    }
    catch (error) {
      if (policy(error)) {
        throw error;
      }

      await op.retry();
    }
  } while (op.continue);

  return op.toJSON();
}
