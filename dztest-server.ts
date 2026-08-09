import "dotenv/config";
process.env.NODE_ENV = "production";
process.env.DISABLE_HMR = "true";
const { default: app } = await import("./server");
setTimeout(() => {
  app.listen(3001, "0.0.0.0", () => {
    console.log("TEST SERVER on http://localhost:3001");
  });
}, 1500);
