import mongoose, { ClientSession } from 'mongoose';

/**
 * Executes `work` inside a MongoDB transaction when connected to a replica set / mongos
 * (e.g. MongoDB Atlas in production). Gracefully falls back to non-transactional execution
 * on standalone MongoDB instances (e.g. local dev or single-node test runners).
 */
export async function withOptionalTransaction<T>(
  work: (session?: ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (err: any) {
    // MongoServerError 20: Transaction numbers are only allowed on a replica set member or mongos
    if (
      err?.code === 20 ||
      err?.codeName === 'IllegalOperation' ||
      (typeof err?.message === 'string' && err.message.includes('Transaction numbers are only allowed'))
    ) {
      return work(undefined);
    }
    throw err;
  } finally {
    await session.endSession();
  }
}
