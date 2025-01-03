// Import Node.js Dependencies
import timers from "node:timers/promises";

// Import Internal Dependencies
import { RetryOptions } from "../retry";

// CONSTANTS
const kDefaultOperationOptions: Partial<RetryOptions> = {
  retries: 3,
  minTimeout: 1_000,
  maxTimeout: Infinity,
  forever: false,
  unref: false,
  factor: 2,
  signal: null
};

export interface OperationResult<T> {
  data: T;
  metrics: {
    attempt: number;
    executionTimestamp: number;
    elapsedTimeoutTime: number;
  };
}

export default class Operation<T> {
  private retries: number;
  private minTimeout: number;
  private maxTimeout: number;
  private forever: boolean;
  private unref: boolean;
  private factor: number;
  private signal: AbortSignal;
  private data: T;
  private continueExecution = true;

  private attempt = 0;
  private startAt = Date.now();
  private executionTimestamp: number;
  private elapsedTimeoutTime = 0;

  constructor(options: RetryOptions) {
    Object.assign(this, {}, kDefaultOperationOptions, options);
    if (this.forever) {
      this.retries = Infinity;
    }
  }

  /**
   * @see http://dthain.blogspot.com/2009/02/exponential-backoff-in-distributed.html
   */
  private get backoff() {
    return Math.min(this.minTimeout * Math.pow(this.factor, this.attempt - 1), this.maxTimeout);
  }

  get continue() {
    return this.continueExecution;
  }

  ensureAbort() {
    if (this.signal === null) {
      return;
    }

    if (this.signal.aborted) {
      throw new Error("Aborted");
    }
  }

  async retry() {
    this.ensureAbort();
    this.attempt++;

    if (this.attempt > this.retries) {
      // TODO: add error causes ?

      throw new Error("Exceeded the maximum number of allowed retries!");
    }

    const timeout = this.backoff;
    const signal = this.signal ?? void 0;
    this.continueExecution = true;

    await timers.setTimeout(timeout, void 0, { ref: this.unref, signal });
    this.ensureAbort();

    this.elapsedTimeoutTime += timeout;
  }

  success(data: T) {
    this.data = data;

    this.continueExecution = false;
    this.executionTimestamp = Date.now() - this.startAt;
  }

  toJSON(): OperationResult<T> {
    return {
      data: this.data,
      metrics: {
        attempt: this.attempt,
        executionTimestamp: this.executionTimestamp,
        elapsedTimeoutTime: this.elapsedTimeoutTime
      }
    };
  }
}
