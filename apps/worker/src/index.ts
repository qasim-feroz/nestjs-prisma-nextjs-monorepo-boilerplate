import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

// ---------------------------------------------
// Redis Connection
// ---------------------------------------------
const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

connection.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

connection.on('connect', () => {
  console.log('✅ Connected to Redis');
});

connection.on('ready', () => {
  console.log('✅ Redis is ready');
  initializeWorker();
});

// ---------------------------------------------
// Worker Job Handlers
// ---------------------------------------------
const jobHandlers: Record<
  string,
  (job: Job) => Promise<any>
> = {
  "send-email": async (job) => {
    const { to, body } = job.data;
    console.log(`📧 Sending email to ${to}: ${body}`);

    // Simulate processing time
    await sleep(1500);

    return { status: "sent" };
  },

  "generate-report": async (job) => {
    console.log(`📊 Generating report for user ${job.data.userId}`);
    
    await sleep(2000);

    return { status: "report_ready" };
  },
};

// ---------------------------------------------
// Helper
// ---------------------------------------------
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Wait for Redis connection before initializing worker
let worker: Worker | null = null;
let taskQueue: Queue | null = null;

function initializeWorker() {
  if (taskQueue || worker) {
    return; // Already initialized
  }

  // ---------------------------------------------
  // Task Queue
  // ---------------------------------------------
  taskQueue = new Queue("tasks", { connection });

  // ---------------------------------------------
  // Worker
  // ---------------------------------------------
  worker = new Worker(
    "tasks",
    async (job: Job) => {
      const handler = jobHandlers[job.name];

      if (!handler) {
        console.error(`❌ No handler found for job type: ${job.name}`);
        throw new Error(`Unknown job type: ${job.name}`);
      }

      console.log(`⚙️  Processing job ${job.id} (${job.name})`);

      return handler(job);
    },
    { connection }
  );

  // ---------------------------------------------
  // Worker Event Listeners
  // ---------------------------------------------
  worker.on("completed", (job, result) => {
    console.log(`✅ Job ${job.id} completed. Result:`, result);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  console.log("🚀 Worker started and listening for jobs...");
}

// Export taskQueue (will be available after Redis connects)
export { taskQueue };

// ---------------------------------------------
// Graceful Shutdown
// ---------------------------------------------
process.on("SIGTERM", async () => {
  console.log("⚠️ Worker shutting down...");
  if (worker) {
    await worker.close();
  }
  await connection.quit();
  process.exit(0);
});

// Initialize if Redis is already connected
if (connection.status === 'ready') {
  initializeWorker();
} else {
  console.log("⏳ Waiting for Redis connection...");
}
